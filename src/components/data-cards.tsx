"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchActivity } from "@/components/search-results";

interface DataCardsProps {
  activities: SearchActivity[];
  accentColor?: string;
}

interface CardData {
  id: number;
  title: string;
  source: string;
  toolType: string;
  metrics: { label: string; value: string; positive: boolean | null }[];
  tickers: string[];
  timestamp: number;
}

const ACCENT = {
  emerald: { border: "border-emerald-500/15", text: "text-emerald-400", bg: "bg-emerald-500/8", glow: "shadow-[0_2px_12px_rgba(52,211,153,0.08)]" },
  red: { border: "border-red-500/15", text: "text-red-400", bg: "bg-red-500/8", glow: "shadow-[0_2px_12px_rgba(248,113,113,0.08)]" },
  violet: { border: "border-violet-500/15", text: "text-violet-400", bg: "bg-violet-500/8", glow: "shadow-[0_2px_12px_rgba(167,139,250,0.08)]" },
};

const TOOL_LABELS: Record<string, string> = {
  search_web: "WEB",
  search_academic: "RESEARCH",
  search_financial: "MARKET",
  search_news: "NEWS",
};

const MAX_CARDS = 3;
const CARD_TTL_MS = 30000;

let cardIdCounter = 0;

function extractMetrics(
  content: string
): { label: string; value: string; positive: boolean | null }[] {
  const metrics: { label: string; value: string; positive: boolean | null }[] =
    [];
  const seen = new Set<string>();

  const pctPattern = /([+-]?\d+\.?\d*)\s*%/g;
  let match;
  while ((match = pctPattern.exec(content)) !== null) {
    const val = parseFloat(match[1]);
    const key = `pct_${val}`;
    if (!seen.has(key)) {
      seen.add(key);
      metrics.push({
        label: "Change",
        value: `${val >= 0 ? "+" : ""}${val}%`,
        positive: val >= 0,
      });
    }
    if (metrics.length >= 3) break;
  }

  const dollarPattern = /\$[\d,]+\.?\d*\s*[BMKTbmkt]?(?:illion)?/g;
  while ((match = dollarPattern.exec(content)) !== null) {
    const key = `dollar_${match[0]}`;
    if (!seen.has(key)) {
      seen.add(key);
      metrics.push({ label: "Price", value: match[0], positive: null });
    }
    if (metrics.length >= 4) break;
  }

  return metrics.slice(0, 3);
}

function extractTickers(content: string): string[] {
  const tickerPattern = /\b([A-Z]{1,5})\b/g;
  const common = new Set([
    "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL",
    "CAN", "HER", "WAS", "ONE", "OUR", "OUT", "HAS", "ITS",
    "LET", "SAY", "SHE", "TOO", "USE", "HIM", "HOW", "INC",
    "LLC", "CEO", "CFO", "CTO", "SEC", "IPO", "ETF", "GDP",
    "API", "USD", "EUR", "GBP", "YOY", "QOQ", "EPS", "EBITDA",
  ]);
  const tickers: string[] = [];
  const seen = new Set<string>();
  let match;
  while ((match = tickerPattern.exec(content)) !== null) {
    const t = match[1];
    if (t.length >= 2 && t.length <= 5 && !common.has(t) && !seen.has(t)) {
      seen.add(t);
      tickers.push(t);
    }
    if (tickers.length >= 2) break;
  }
  return tickers;
}

export function DataCards({ activities, accentColor }: DataCardsProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const prevCountRef = useRef(0);

  const a = accentColor && accentColor in ACCENT
    ? ACCENT[accentColor as keyof typeof ACCENT]
    : { border: "border-white/[0.06]", text: "text-white/50", bg: "bg-white/[0.03]", glow: "" };

  const completedActivities = useMemo(
    () => activities.filter((a) => a.status === "complete" && a.results?.length),
    [activities]
  );

  useEffect(() => {
    if (completedActivities.length <= prevCountRef.current) {
      prevCountRef.current = completedActivities.length;
      return;
    }

    const newActivities = completedActivities.slice(prevCountRef.current);
    prevCountRef.current = completedActivities.length;

    const newCards: CardData[] = [];
    for (const activity of newActivities) {
      const results = activity.results ?? [];
      if (results.length === 0) continue;

      const combinedContent = results
        .slice(0, 2)
        .map((r) => `${r.title} ${r.content}`)
        .join(" ");

      const metrics = extractMetrics(combinedContent);
      const tickers = extractTickers(combinedContent);

      if (metrics.length === 0 && tickers.length === 0) {
        newCards.push({
          id: ++cardIdCounter,
          title: results[0].title.slice(0, 60) || activity.query,
          source: results[0].source ?? new URL(results[0].url || "https://unknown").hostname.replace("www.", ""),
          toolType: activity.tool_name,
          metrics: [],
          tickers: [],
          timestamp: Date.now(),
        });
      } else {
        newCards.push({
          id: ++cardIdCounter,
          title: tickers.length > 0 ? tickers.join("  ·  ") : activity.query.slice(0, 40),
          source: results[0].source ?? "",
          toolType: activity.tool_name,
          metrics,
          tickers,
          timestamp: Date.now(),
        });
      }
    }

    if (newCards.length > 0) {
      setCards((prev) => [...prev, ...newCards].slice(-MAX_CARDS));
    }
  }, [completedActivities]);

  useEffect(() => {
    if (cards.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setCards((prev) => prev.filter((c) => now - c.timestamp < CARD_TTL_MS));
    }, 1000);
    return () => clearInterval(interval);
  }, [cards.length]);

  if (cards.length === 0) return null;

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-none max-w-xs">
      {cards.map((card) => {
        const age = Date.now() - card.timestamp;
        const isFading = age > CARD_TTL_MS - 2000;

        return (
          <div
            key={card.id}
            className={`rounded-md border ${a.border} bg-black/75 backdrop-blur-xl transition-all duration-700 ${a.glow} ${
              isFading ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
            } animate-slide-in-right`}
          >
            {/* Inner content */}
            <div className="px-3 py-2 min-w-[160px]">
              {/* Tag + source */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-mono font-bold tracking-[0.12em] uppercase ${a.text}`}>
                  {TOOL_LABELS[card.toolType] ?? "SOURCE"}
                </span>
                {card.source && (
                  <>
                    <span className="h-0.5 w-0.5 rounded-full bg-white/15" />
                    <span className="text-[9px] font-mono text-white/25 truncate max-w-[100px]">
                      {card.source}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <p className="text-xs font-medium text-white truncate leading-tight mb-1 tracking-tight">
                {card.title}
              </p>

              {/* Metrics row */}
              {card.metrics.length > 0 && (
                <div className="flex items-center gap-2">
                  {card.metrics.map((m, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold tabular-nums ${
                        m.positive === true
                          ? "text-emerald-400"
                          : m.positive === false
                            ? "text-red-400"
                            : "text-white/60"
                      }`}
                    >
                      {m.positive === true && (
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
                      )}
                      {m.positive === false && (
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                      )}
                      {m.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom accent line */}
            <div className={`h-[1px] ${a.bg} mx-2 mb-0`} />
          </div>
        );
      })}
    </div>
  );
}
