"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PersonaType } from "@/lib/personas";
import type { TranscriptEntry } from "@/components/transcript";
import type { SearchActivity } from "@/components/search-results";

interface LiveChyronProps {
  personaType: PersonaType;
  personaName: string;
  topic?: string;
  paperUrl?: string;
  watchlist?: string[];
  transcript: TranscriptEntry[];
  searchActivities: SearchActivity[];
  accentColor: string;
}

const ACCENT = {
  emerald: {
    bar: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    tagBorder: "border-emerald-500/20",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]",
    metricUp: "text-emerald-400",
  },
  red: {
    bar: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    tagBorder: "border-red-500/20",
    glow: "shadow-[0_0_20px_rgba(248,113,113,0.15)]",
    metricUp: "text-emerald-400",
  },
  violet: {
    bar: "bg-violet-400",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    dot: "bg-violet-400",
    tagBorder: "border-violet-500/20",
    glow: "shadow-[0_0_20px_rgba(167,139,250,0.15)]",
    metricUp: "text-emerald-400",
  },
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Extract the most recently discussed ticker from transcript text. */
function extractCurrentTicker(
  text: string,
  watchlist: string[]
): string | null {
  const upper = text.toUpperCase();
  for (let i = watchlist.length - 1; i >= 0; i--) {
    if (upper.includes(watchlist[i].toUpperCase())) {
      return watchlist[i].toUpperCase();
    }
  }
  return null;
}

const PERSONA_LABELS: Record<PersonaType, string> = {
  "financial-analyst": "MARKET BRIEFING",
  "news-anchor": "LIVE REPORT",
  "research-explainer": "RESEARCH BRIEF",
};

const PERSONA_ICONS: Record<PersonaType, React.ReactNode> = {
  "financial-analyst": (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "news-anchor": (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  "research-explainer": (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
};

export function LiveChyron({
  personaType,
  personaName,
  topic,
  paperUrl,
  watchlist,
  transcript,
  searchActivities,
  accentColor,
}: LiveChyronProps) {
  const c = ACCENT[accentColor as keyof typeof ACCENT] ?? ACCENT.emerald;
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const sourceCount = useMemo(() => {
    return searchActivities.filter((a) => a.status === "complete").length;
  }, [searchActivities]);

  const currentTicker = useMemo(() => {
    if (personaType !== "financial-analyst" || !watchlist?.length) return null;
    const replicaEntries = transcript.filter((t) => t.role === "replica");
    if (replicaEntries.length === 0) return null;
    const recent = replicaEntries.slice(-2);
    for (let i = recent.length - 1; i >= 0; i--) {
      const found = extractCurrentTicker(recent[i].text, watchlist);
      if (found) return found;
    }
    return null;
  }, [personaType, watchlist, transcript]);

  const headline = useMemo(() => {
    if (personaType === "financial-analyst") {
      if (currentTicker) return currentTicker;
      if (watchlist?.length) return watchlist.map((t) => t.toUpperCase()).join("  ·  ");
      return topic ?? "Markets";
    }
    if (personaType === "news-anchor") {
      return topic ?? "Breaking News";
    }
    if (personaType === "research-explainer") {
      if (paperUrl) {
        try {
          const url = new URL(paperUrl);
          const pathParts = url.pathname.split("/").filter(Boolean);
          const id = pathParts[pathParts.length - 1] ?? "";
          if (url.hostname.includes("arxiv")) return `arXiv: ${id}`;
          if (url.hostname.includes("pubmed")) return `PubMed: ${id}`;
          return id.slice(0, 30) || "Paper Analysis";
        } catch {
          return "Paper Analysis";
        }
      }
      return topic ?? "Research";
    }
    return topic ?? "";
  }, [personaType, topic, paperUrl, watchlist, currentTicker]);

  const subtitle = useMemo(() => {
    if (personaType === "financial-analyst" && watchlist?.length) {
      if (currentTicker) {
        const remaining = watchlist
          .map((t) => t.toUpperCase())
          .filter((t) => t !== currentTicker);
        if (remaining.length > 0) {
          return `Portfolio: ${watchlist.length} tickers`;
        }
      }
      return `Covering ${watchlist.length} position${watchlist.length > 1 ? "s" : ""}`;
    }
    if (personaType === "research-explainer" && paperUrl && topic) {
      return topic;
    }
    return null;
  }, [personaType, watchlist, currentTicker, paperUrl, topic]);

  const tagLabel = PERSONA_LABELS[personaType];

  return (
    <div
      className={`absolute bottom-6 left-6 z-20 transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`flex overflow-hidden rounded-md ${c.glow}`}
        style={{ maxWidth: "440px" }}
      >
        {/* Accent bar — vertical stripe */}
        <div className={`w-[3px] ${c.bar} shrink-0`} />

        {/* Content area */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/[0.06] border-l-0 rounded-r-md flex flex-col min-w-0">
          {/* Top row: tag + metadata */}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            {/* Live indicator + label */}
            <div className={`flex items-center gap-1.5 ${c.bg} border ${c.tagBorder} rounded-sm px-2 py-0.5`}>
              <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse-subtle`} />
              <span className={`${c.text}`}>
                {PERSONA_ICONS[personaType]}
              </span>
              <span className={`text-[9px] font-mono font-bold tracking-[0.15em] uppercase ${c.text}`}>
                {tagLabel}
              </span>
            </div>

            <span className="flex-1" />

            {/* Source count */}
            {sourceCount > 0 && (
              <span className="text-[9px] font-mono text-white/35 tracking-wide">
                {sourceCount} source{sourceCount !== 1 ? "s" : ""}
              </span>
            )}

            {/* Separator dot */}
            {sourceCount > 0 && (
              <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
            )}

            {/* Elapsed timer */}
            <span className="text-[10px] font-mono text-white/25 tabular-nums tracking-wider">
              {formatElapsed(elapsed)}
            </span>
          </div>

          {/* Headline */}
          <div className="px-3 pb-1.5">
            <p className="text-[13px] font-semibold text-white truncate leading-tight tracking-tight">
              {headline}
            </p>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-[10px] text-white/40 truncate leading-tight mt-0.5 font-mono">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom accent line */}
          <div className={`h-[1px] ${c.bar} opacity-20`} />
        </div>
      </div>
    </div>
  );
}
