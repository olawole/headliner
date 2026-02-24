'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { useConversationRecording } from '../../hooks/use-conversation-recording';
import type { RecordingMode } from '../../hooks/use-conversation-recording';
import styles from './record-button.module.css';

function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

const MODE_LABELS: Record<RecordingMode, string> = {
	'avatar-only': 'Avatar only',
	'both': 'Avatar + You',
};

const MODE_DESCRIPTIONS: Record<RecordingMode, string> = {
	'avatar-only': 'Record the AI avatar video and audio',
	'both': 'Record both avatar and your camera/mic',
};

export const RecordButton = memo(() => {
	const {
		isRecording,
		duration,
		recordingMode,
		setRecordingMode,
		startRecording,
		stopRecording,
		isProcessing,
	} = useConversationRecording();

	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu on outside click
	useEffect(() => {
		if (!showMenu) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setShowMenu(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showMenu]);

	const handleRecordClick = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
		setShowMenu(false);
	};

	const handleModeSelect = (mode: RecordingMode) => {
		setRecordingMode(mode);
		setShowMenu(false);
	};

	return (
		<div className={styles.recordButtonContainer} ref={menuRef}>
			{/* Main record/stop button */}
			<button
				type="button"
				onClick={handleRecordClick}
				disabled={isProcessing}
				className={`${styles.recordButton} ${isRecording ? styles.recordButtonActive : ''}`}
				title={isRecording ? 'Stop recording' : `Record: ${MODE_LABELS[recordingMode]}`}
			>
				<span className={styles.recordButtonIcon}>
					{isRecording ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							role="img"
							aria-label="Stop Recording"
						>
							<rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" />
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							role="img"
							aria-label="Start Recording"
						>
							<circle cx="12" cy="12" r="7" fill="#ef4444" />
						</svg>
					)}
				</span>
			</button>

			{/* Small chevron to open mode selector (only when not recording) */}
			{!isRecording && (
				<button
					type="button"
					onClick={() => setShowMenu((v) => !v)}
					className={styles.chevronButton}
					title="Choose recording mode"
					aria-label="Choose recording mode"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
			)}

			{/* Mode selector dropdown */}
			{showMenu && !isRecording && (
				<div className={styles.modeMenu}>
					{(['avatar-only', 'both'] as RecordingMode[]).map((mode) => (
						<button
							key={mode}
							type="button"
							onClick={() => handleModeSelect(mode)}
							className={`${styles.modeOption} ${recordingMode === mode ? styles.modeOptionActive : ''}`}
						>
							<span className={styles.modeRadio}>
								{recordingMode === mode && <span className={styles.modeRadioDot} />}
							</span>
							<span className={styles.modeText}>
								<span className={styles.modeLabel}>{MODE_LABELS[mode]}</span>
								<span className={styles.modeDescription}>{MODE_DESCRIPTIONS[mode]}</span>
							</span>
						</button>
					))}
				</div>
			)}

			{/* Duration badge when recording */}
			{isRecording && (
				<div className={styles.durationBadge}>
					<span className={styles.recordingDot} />
					{formatDuration(duration)}
				</div>
			)}
		</div>
	);
});

RecordButton.displayName = 'RecordButton';
