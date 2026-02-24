'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDaily, useLocalSessionId } from '@daily-co/daily-react';
import { useReplicaIDs } from './use-replica-ids';

export type RecordingMode = 'avatar-only' | 'both';

/** Canvas dimensions for composited recording */
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

/** PiP overlay sizing (fraction of canvas width) */
const PIP_SCALE = 0.22;
const PIP_PADDING = 16;
const PIP_BORDER_RADIUS = 12;

function getSupportedMimeType(): string | null {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}

/**
 * Mix multiple audio tracks into a single track using Web Audio API.
 * MediaRecorder only captures one audio track from a MediaStream,
 * so we need to merge avatar + user audio into one track.
 */
function mixAudioTracks(tracks: MediaStreamTrack[]): { track: MediaStreamTrack; cleanup: () => void } {
  const audioCtx = new AudioContext();
  const destination = audioCtx.createMediaStreamDestination();

  for (const track of tracks) {
    const source = audioCtx.createMediaStreamSource(new MediaStream([track]));
    source.connect(destination);
  }

  const mixedTrack = destination.stream.getAudioTracks()[0];
  const cleanup = () => {
    audioCtx.close();
  };

  return { track: mixedTrack, cleanup };
}

export interface ConversationRecordingState {
  isRecording: boolean;
  duration: number;
  recordingMode: RecordingMode;
  setRecordingMode: (mode: RecordingMode) => void;
  startRecording: () => void;
  stopRecording: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const useConversationRecording = (): ConversationRecordingState => {
  const daily = useDaily();
  const replicaIds = useReplicaIDs();
  const localSessionId = useLocalSessionId();

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('avatar-only');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const trackCleanupRef = useRef<(() => void) | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const triggerDownload = useCallback((chunks: Blob[]) => {
    if (chunks.length === 0) return;

    const mimeType = chunks[0].type || 'video/webm';
    const blob = new Blob(chunks, { type: mimeType });
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avatar-recording-${timestamp}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearTrackListeners = useCallback(() => {
    if (trackCleanupRef.current) {
      trackCleanupRef.current();
      trackCleanupRef.current = null;
    }
  }, []);

  const stopCanvasLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    canvasRef.current = null;
  }, []);

  const handleRecordingStopped = useCallback(() => {
    const chunks = chunksRef.current;
    chunksRef.current = [];
    clearTimer();
    clearTrackListeners();
    stopCanvasLoop();

    if (chunks.length > 0) {
      triggerDownload(chunks);
    }

    setIsProcessing(false);
    setIsRecording(false);
    setDuration(0);
  }, [clearTimer, clearTrackListeners, stopCanvasLoop, triggerDownload]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      setIsProcessing(true);
      recorder.stop();
    } else {
      clearTimer();
      clearTrackListeners();
      stopCanvasLoop();
      setIsRecording(false);
      setDuration(0);
    }
  }, [clearTimer, clearTrackListeners, stopCanvasLoop]);

  const startRecording = useCallback(() => {
    if (!daily) {
      setError('Call not connected');
      return;
    }

    const replicaId = replicaIds[0];
    if (!replicaId) {
      setError('Avatar not connected yet');
      return;
    }

    const participants = daily.participants();
    const replica = participants[replicaId];
    if (!replica) {
      setError('Avatar participant not available');
      return;
    }

    // Get avatar tracks
    const replicaVideoTrack = replica.tracks.video.persistentTrack ?? replica.tracks.video.track;
    const replicaAudioTrack = replica.tracks.audio.persistentTrack ?? replica.tracks.audio.track;

    if (!replicaVideoTrack || !replicaAudioTrack) {
      setError('Avatar video/audio tracks not available');
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('Recording is not supported in this browser');
      return;
    }

    const tracksToWatch: MediaStreamTrack[] = [replicaVideoTrack, replicaAudioTrack];
    let recordStream: MediaStream;
    let extraCleanup: (() => void) | null = null;

    if (recordingMode === 'both' && localSessionId) {
      const local = participants.local;
      const localVideoTrack = local?.tracks.video.persistentTrack ?? local?.tracks.video.track ?? null;
      const localAudioTrack = local?.tracks.audio.persistentTrack ?? local?.tracks.audio.track ?? null;

      // Create offscreen canvas for PiP compositing
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Could not create canvas context');
        return;
      }

      canvasRef.current = canvas;

      // Create hidden video elements to source frames from
      const avatarVideo = document.createElement('video');
      avatarVideo.srcObject = new MediaStream([replicaVideoTrack]);
      avatarVideo.muted = true;
      avatarVideo.playsInline = true;
      avatarVideo.play();

      let localVideo: HTMLVideoElement | null = null;
      if (localVideoTrack) {
        localVideo = document.createElement('video');
        localVideo.srcObject = new MediaStream([localVideoTrack]);
        localVideo.muted = true;
        localVideo.playsInline = true;
        localVideo.play();
        tracksToWatch.push(localVideoTrack);
      }

      if (localAudioTrack) {
        tracksToWatch.push(localAudioTrack);
      }

      // Compositing loop: draw avatar full-screen, user as PiP overlay
      const drawFrame = () => {
        // Draw avatar as full background (cover)
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (avatarVideo.readyState >= 2) {
          const vw = avatarVideo.videoWidth || CANVAS_WIDTH;
          const vh = avatarVideo.videoHeight || CANVAS_HEIGHT;
          const scale = Math.max(CANVAS_WIDTH / vw, CANVAS_HEIGHT / vh);
          const sw = vw * scale;
          const sh = vh * scale;
          const sx = (CANVAS_WIDTH - sw) / 2;
          const sy = (CANVAS_HEIGHT - sh) / 2;
          ctx.drawImage(avatarVideo, sx, sy, sw, sh);
        }

        // Draw local user as PiP in bottom-left
        if (localVideo && localVideo.readyState >= 2) {
          const pipW = Math.round(CANVAS_WIDTH * PIP_SCALE);
          const pipH = Math.round(pipW * (localVideo.videoHeight / localVideo.videoWidth || 9 / 16));
          const pipX = PIP_PADDING;
          const pipY = CANVAS_HEIGHT - pipH - PIP_PADDING;

          // Rounded rectangle clip
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(pipX, pipY, pipW, pipH, PIP_BORDER_RADIUS);
          ctx.clip();

          // PiP background
          ctx.fillStyle = '#111827';
          ctx.fillRect(pipX, pipY, pipW, pipH);

          // Draw local video (cover fit)
          const lw = localVideo.videoWidth;
          const lh = localVideo.videoHeight;
          const lScale = Math.max(pipW / lw, pipH / lh);
          const lsw = lw * lScale;
          const lsh = lh * lScale;
          const lsx = pipX + (pipW - lsw) / 2;
          const lsy = pipY + (pipH - lsh) / 2;
          ctx.drawImage(localVideo, lsx, lsy, lsw, lsh);

          ctx.restore();

          // PiP border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(pipX, pipY, pipW, pipH, PIP_BORDER_RADIUS);
          ctx.stroke();
        }

        animFrameRef.current = requestAnimationFrame(drawFrame);
      };

      animFrameRef.current = requestAnimationFrame(drawFrame);

      // Capture canvas as video stream at 30fps
      const canvasStream = canvas.captureStream(30);
      const canvasVideoTrack = canvasStream.getVideoTracks()[0];

      // Mix audio tracks
      const audioTracks = [replicaAudioTrack];
      if (localAudioTrack) {
        audioTracks.push(localAudioTrack);
      }

      const { track: mixedAudioTrack, cleanup: audioCleanup } = mixAudioTracks(audioTracks);

      recordStream = new MediaStream([canvasVideoTrack, mixedAudioTrack]);

      extraCleanup = () => {
        audioCleanup();
        avatarVideo.pause();
        avatarVideo.srcObject = null;
        if (localVideo) {
          localVideo.pause();
          localVideo.srcObject = null;
        }
      };
    } else {
      // Avatar-only: record the raw tracks directly
      recordStream = new MediaStream([replicaVideoTrack, replicaAudioTrack]);
    }

    const recorder = new MediaRecorder(recordStream, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
    });

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      handleRecordingStopped();
    };

    recorder.onerror = () => {
      setError('Recording error occurred');
      clearTimer();
      clearTrackListeners();
      stopCanvasLoop();
      setIsRecording(false);
      setIsProcessing(false);
      setDuration(0);
    };

    // Stop recording if any primary track ends (e.g. user leaves)
    const onTrackEnded = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopRecording();
      }
    };
    for (const track of tracksToWatch) {
      track.addEventListener('ended', onTrackEnded);
    }
    const savedExtraCleanup = extraCleanup;
    trackCleanupRef.current = () => {
      for (const track of tracksToWatch) {
        track.removeEventListener('ended', onTrackEnded);
      }
      savedExtraCleanup?.();
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setError(null);

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [daily, replicaIds, localSessionId, recordingMode, handleRecordingStopped, stopRecording, clearTimer, clearTrackListeners, stopCanvasLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (trackCleanupRef.current) {
        trackCleanupRef.current();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    duration,
    recordingMode,
    setRecordingMode,
    startRecording,
    stopRecording,
    isProcessing,
    error,
  };
};
