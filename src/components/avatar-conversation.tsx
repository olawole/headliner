"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CreditCard,
  KeyRound,
} from "lucide-react";
import { Conversation } from "@/components/cvi/components/conversation";
import { useObservableEvent } from "@/components/cvi/hooks/use-observable-event";
import { useSendAppMessage } from "@/components/cvi/hooks/use-send-app-message";
import { Transcript, type TranscriptEntry } from "@/components/transcript";
import {
  SearchResults,
  type SearchActivity,
} from "@/components/search-results";
import { ExportSummary } from "@/components/export-summary";
import { LiveChyron } from "@/components/live-chyron";
import { DataCards } from "@/components/data-cards";
import { getPersonaConfig, type PersonaType } from "@/lib/personas";
import { UserMenuInline } from "@/components/auth/user-menu";
import { useAuthStore } from "@/app/stores/auth-store";

/* ── Accent maps ──────────────────────────────────────────────────── */
const ACCENT_SPINNER: Record<string, string> = {
  emerald: "border-t-emerald-400",
  red: "border-t-red-400",
  violet: "border-t-violet-400",
};
const ACCENT_BTN: Record<string, string> = {
  emerald: "bg-emerald-600 hover:bg-emerald-500",
  red: "bg-red-600 hover:bg-red-500",
  violet: "bg-violet-600 hover:bg-violet-500",
};
const ACCENT_RING: Record<string, string> = {
  emerald: "border-emerald-400/30",
  red: "border-red-400/30",
  violet: "border-violet-400/30",
};
const ACCENT_GLOW: Record<string, string> = {
  emerald: "shadow-[0_0_40px_rgba(52,211,153,0.12)]",
  red: "shadow-[0_0_40px_rgba(248,113,113,0.12)]",
  violet: "shadow-[0_0_40px_rgba(167,139,250,0.12)]",
};

/* ── Boot sequence messages ──────────────────────────────────────── */
const BOOT_MESSAGES = [
  "Initializing neural link",
  "Connecting to avatar",
  "Loading research context",
  "Preparing briefing data",
  "Almost ready",
];

interface AvatarConversationProps {
  personaType: PersonaType;
  topic?: string;
  paperUrl?: string;
  watchlist?: string[];
  difficulty?: string;
}

export function AvatarConversation({
  personaType,
  topic,
  paperUrl,
  watchlist,
  difficulty,
}: AvatarConversationProps) {
  const router = useRouter();
  const persona = getPersonaConfig(personaType);
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [searchActivities, setSearchActivities] = useState<SearchActivity[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [bootIdx, setBootIdx] = useState(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const didInitRef = useRef(false);
  const didGreetingPromptRef = useRef(false);
  const mountedRef = useRef(true);

  const sendMessage = useSendAppMessage();
  const accent = persona?.accentColor ?? "emerald";

  /* ── Boot sequence animation ─────────────────────────────────────── */
  useEffect(() => {
    if (!isLoading && conversationUrl) return;
    const interval = setInterval(() => {
      setBootIdx((prev) => (prev + 1) % BOOT_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading, conversationUrl]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/conversation", {
        method: "POST",
        headers,
        body: JSON.stringify({ persona_type: personaType, topic, paper_url: paperUrl, watchlist, difficulty }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorCode(data.error ?? null);
        throw new Error(data.message || data.error || "Failed to create conversation");
      }
      const data = await res.json();
      setConversationUrl(data.conversation_url);
      setConversationId(data.conversation_id);
      conversationIdRef.current = data.conversation_id;

      if (data.prefetched_activities?.length) {
        const seeded: SearchActivity[] = data.prefetched_activities.map(
          (a: { tool_name: string; query: string; results: unknown[] }) => ({
            tool_name: a.tool_name,
            query: a.query,
            status: "complete" as const,
            results: a.results,
            timestamp: Date.now(),
          })
        );
        setSearchActivities(seeded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [personaType, topic, paperUrl, watchlist, difficulty, getAccessToken]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    startConversation();
  }, [startConversation]);

  const handleToolCall = useCallback(
    async (properties: Record<string, unknown>) => {
      const toolName = properties.name as string;
      let query = "";
      try {
        const args = typeof properties.arguments === "string" ? JSON.parse(properties.arguments) : properties.arguments;
        query = args?.query ?? "";
      } catch { query = String(properties.arguments ?? ""); }

      const activityTimestamp = Date.now();
      setSearchActivities((prev) => [{ tool_name: toolName, query, status: "searching", timestamp: activityTimestamp }, ...prev]);

      try {
        const searchHeaders: Record<string, string> = { "Content-Type": "application/json" };
        const searchToken = getAccessToken();
        if (searchToken) searchHeaders["Authorization"] = `Bearer ${searchToken}`;

        const res = await fetch("/api/search", {
          method: "POST",
          headers: searchHeaders,
          body: JSON.stringify({ tool_name: toolName, query }),
        });
        const data = await res.json();
        setSearchActivities((prev) =>
          prev.map((a) => a.timestamp === activityTimestamp ? { ...a, status: "complete" as const, results: data.results } : a)
        );
        if (conversationIdRef.current) {
          sendMessage({
            message_type: "conversation",
            event_type: "conversation.tool_call.result",
            conversation_id: conversationIdRef.current,
            properties: { tool_name: toolName, tool_result: JSON.stringify(data.results ?? []) },
          });
        }
      } catch {
        setSearchActivities((prev) =>
          prev.map((a) => a.timestamp === activityTimestamp ? { ...a, status: "error" as const } : a)
        );
      }
    },
    [sendMessage, getAccessToken]
  );

  useObservableEvent(
    useCallback(
      (event: Record<string, unknown>) => {
        const eventType = event.event_type as string;
        if (eventType === "conversation.tool_call") handleToolCall(event.properties as Record<string, unknown>);
        if (eventType === "conversation.utterance") {
          const props = event.properties as { role: "replica" | "user"; speech: string };
          if (props?.speech) setTranscript((prev) => [...prev, { role: props.role, text: props.speech, timestamp: Date.now() }]);
        }
        const hasBriefing = topic || paperUrl || (watchlist && watchlist.length > 0);
        if (eventType === "conversation.replica.stopped_speaking" && hasBriefing && conversationIdRef.current && !didGreetingPromptRef.current) {
          didGreetingPromptRef.current = true;
          let promptText = "";
          if (paperUrl) promptText = "Now walk me through this paper from the beginning — big picture first, then key findings. Use the paper content already in your context, do not search.";
          else if (watchlist && watchlist.length > 0) promptText = `Now give me the full portfolio briefing covering ${watchlist.join(", ")}. All the data is already pre-loaded in your context — present it directly without using any search tools.`;
          else if (topic) promptText = `Now give me the full detailed briefing on ${topic}. Use the data already in your context.`;
          sendMessage({ message_type: "conversation", event_type: "conversation.respond", conversation_id: conversationIdRef.current, properties: { text: promptText } });
        }
      },
      [handleToolCall, topic, paperUrl, watchlist, sendMessage]
    )
  );

  const toggleFullscreen = useCallback(() => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const SIDEBAR_MIN = 300;
  const SIDEBAR_MAX = 520;
  const SIDEBAR_DEFAULT = 384;
  const COLLAPSE_THRESHOLD = 200;

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = isSidebarOpen ? sidebarWidth : 0;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [isSidebarOpen, sidebarWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = dragStartXRef.current - e.clientX;
      const newW = dragStartWidthRef.current + delta;
      if (newW < COLLAPSE_THRESHOLD) { setIsSidebarOpen(false); setSidebarWidth(SIDEBAR_DEFAULT); }
      else { setIsSidebarOpen(true); setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, newW))); }
    };
    const onUp = () => { if (!isDraggingRef.current) return; isDraggingRef.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, []);

  const handleLeave = useCallback(async () => {
    if (conversationIdRef.current) {
      try { await fetch(`/api/conversation?id=${conversationIdRef.current}`, { method: "DELETE" }); }
      catch (err) { console.error("Failed to end conversation:", err); }
    }
    router.push("/");
  }, [router]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        if (!mountedRef.current && conversationIdRef.current) {
          fetch(`/api/conversation?id=${conversationIdRef.current}`, { method: "DELETE" }).catch(console.error);
        }
      }, 200);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Error ───────────────────────────────────────────────────────── */
  if (error) {
    const isCredits = errorCode === "out_of_credits";
    const isAuthError = errorCode === "invalid_api_key";
    const ErrorIcon = isCredits ? CreditCard : isAuthError ? KeyRound : AlertTriangle;

    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="absolute inset-0 bg-neural-mesh opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-md w-full rounded-xl glass-elevated p-8 text-center space-y-5"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
            <ErrorIcon size={24} className="text-red-400" />
          </div>
          <h2 className="font-display text-lg font-semibold text-white">
            {isCredits ? "Out of Credits" : isAuthError ? "API Key Issue" : "Connection Error"}
          </h2>
          <p className="text-sm text-[--text-secondary] leading-relaxed">
            {isCredits ? "Top up your Tavus credits to continue." : isAuthError ? "Your Tavus API key is invalid or expired." : error}
          </p>
          {(isCredits || isAuthError) && (
            <a href="https://platform.tavus.io" target="_blank" rel="noopener noreferrer"
              className={`inline-block rounded-lg ${ACCENT_BTN[accent]} px-5 py-2.5 text-sm font-medium text-white transition-colors`}>
              {isCredits ? "Get Credits" : "Manage Keys"}
            </a>
          )}
          <div className="flex items-center justify-center gap-3 pt-1">
            {!isCredits && (
              <button onClick={() => { setError(null); setErrorCode(null); didInitRef.current = false; startConversation(); }}
                className="rounded-lg glass px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors">Try Again</button>
            )}
            <button onClick={() => router.push("/")}
              className="rounded-lg border border-[--border-default] px-4 py-2 text-sm text-[--text-secondary] hover:bg-[--surface-2] transition-colors">Back</button>
          </div>
        </motion.div>
      </main>
    );
  }

  /* ── Loading — Boot sequence ────────────────────────────────────── */
  if (isLoading || !conversationUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 bg-neural-mesh opacity-40" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative text-center space-y-6"
        >
          {/* Animated ring */}
          <div className="relative mx-auto h-16 w-16">
            <div className={`absolute inset-0 rounded-full border-2 border-[--border-subtle] ${ACCENT_RING[accent]}`} />
            <div
              className={`absolute inset-0 rounded-full border-2 border-transparent ${ACCENT_SPINNER[accent]}`}
              style={{ animation: "ring-rotate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
            />
            <div className={`absolute inset-2 rounded-full ${ACCENT_GLOW[accent]} animate-pulse-subtle`} />
          </div>

          {/* Boot messages */}
          <div className="space-y-2 min-h-[48px]">
            <p className="text-sm text-white font-medium">
              Connecting to {persona?.name ?? "assistant"}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={bootIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-[--text-quaternary] font-mono tracking-wider"
              >
                {BOOT_MESSAGES[bootIdx]}...
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    );
  }

  /* ── Main ────────────────────────────────────────────────────────── */
  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-[--background]">
      {/* Video */}
      <div ref={videoContainerRef} className="flex-1 relative min-h-[50vh] lg:min-h-screen bg-black group/video">
        <Conversation conversationUrl={conversationUrl} onLeave={handleLeave} />

        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-20 rounded-lg glass p-2 text-white/50 opacity-0 transition-all duration-200 hover:text-white group-hover/video:opacity-100"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <DataCards activities={searchActivities} accentColor={accent} />
        {persona && (
          <LiveChyron personaType={personaType} personaName={persona.name} topic={topic} paperUrl={paperUrl} watchlist={watchlist} transcript={transcript} searchActivities={searchActivities} accentColor={accent} />
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`relative flex-shrink-0 border-t lg:border-t-0 border-[--border-subtle] flex flex-col max-h-[50vh] lg:max-h-screen overflow-hidden ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{
          width: isSidebarOpen ? `${sidebarWidth}px` : 0,
          minWidth: isSidebarOpen ? `${SIDEBAR_MIN}px` : 0,
          transition: isDraggingRef.current ? "none" : "width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease",
        }}
      >
        <div className="hidden lg:flex absolute left-0 top-0 bottom-0 z-30 w-1.5 cursor-col-resize items-center group/drag"
          onMouseDown={handleDragStart} onDoubleClick={() => { setSidebarWidth(SIDEBAR_DEFAULT); setIsSidebarOpen(true); }} title="Drag to resize">
          <div className="absolute inset-y-0 left-0 w-px bg-[--border-subtle] group-hover/drag:bg-white/20 transition-colors" />
          <div className="absolute inset-y-0 -left-1 w-3" />
          <button onClick={(e) => { e.stopPropagation(); setIsSidebarOpen((v) => !v); }}
            className="absolute top-1/2 -translate-y-1/2 -left-3 z-40 flex h-5 w-5 items-center justify-center rounded-full glass border border-[--border-default] text-[--text-tertiary] hover:text-white opacity-0 group-hover/drag:opacity-100 transition-opacity" title="Collapse">
            <ChevronRight size={10} />
          </button>
        </div>

        <div className="flex flex-col h-full overflow-hidden surface-glass" style={{ minWidth: `${SIDEBAR_MIN}px` }}>
          {persona && (
            <div className="px-4 py-3 border-b border-[--border-subtle] flex items-center gap-2.5">
              <span className="text-base">{persona.icon}</span>
              <span className="text-sm font-semibold text-white flex-1 truncate">{persona.name}</span>
              <UserMenuInline />
              <ExportSummary transcript={transcript} searchActivities={searchActivities} personaName={persona.name} topic={topic} accentColor={accent} />
            </div>
          )}
          <SearchResults activities={searchActivities} accentColor={accent} />
          <Transcript entries={transcript} personaName={persona?.name} accentColor={accent} />
        </div>
      </div>

      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 h-8 w-4 items-center justify-center rounded-l-md glass border border-r-0 border-[--border-default] text-[--text-tertiary] hover:text-white transition-all" title="Expand">
          <ChevronLeft size={10} />
        </button>
      )}
    </main>
  );
}
