"use client";

import type { SearchResult } from "@/lib/schemas";

export interface SearchActivity {
  tool_name: string;
  query: string;
  status: "searching" | "complete" | "error";
  results?: SearchResult[];
  timestamp: number;
}

const TOOL_LABELS: Record<string, string> = {
  search_web: "Web",
  search_academic: "Academic",
  search_financial: "Financial",
  search_news: "News",
};

const TOOL_ICONS: Record<string, string> = {
  search_web: "globe",
  search_academic: "book",
  search_financial: "chart",
  search_news: "zap",
};

const ACCENT_TEXT: Record<string, string> = {
  emerald: "text-emerald-400",
  red: "text-red-400",
  violet: "text-violet-400",
};

const ACCENT_LINK: Record<string, string> = {
  emerald: "text-emerald-400/80 hover:text-emerald-300",
  red: "text-red-400/80 hover:text-red-300",
  violet: "text-violet-400/80 hover:text-violet-300",
};

/* ── Financial data extraction ─────────────────────────────────────── */

interface ExtractedMetric {
  label: string;
  value: string;
  positive: boolean | null;
}

function extractMetrics(content: string): ExtractedMetric[] {
  const metrics: ExtractedMetric[] = [];
  const seen = new Set<string>();

  const pctPattern = /([+-]?\d+\.?\d*)\s*%/g;
  let match;
  while ((match = pctPattern.exec(content)) !== null) {
    const val = parseFloat(match[1]);
    const key = `pct_${val}`;
    if (!seen.has(key)) {
      seen.add(key);
      metrics.push({ label: "Change", value: `${val >= 0 ? "+" : ""}${val}%`, positive: val >= 0 });
    }
    if (metrics.length >= 4) break;
  }

  const dollarPattern = /\$[\d,]+\.?\d*\s*[BMKTbmkt]?(?:illion|illion)?/g;
  while ((match = dollarPattern.exec(content)) !== null) {
    const key = `dollar_${match[0]}`;
    if (!seen.has(key)) {
      seen.add(key);
      metrics.push({ label: "Price", value: match[0], positive: null });
    }
    if (metrics.length >= 6) break;
  }

  return metrics.slice(0, 4);
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
    if (tickers.length >= 3) break;
  }
  return tickers;
}

/* ── Icon components ──────────────────────────────────────────────── */

function ToolIcon({ type }: { type: string }) {
  const icon = TOOL_ICONS[type] ?? "globe";
  if (icon === "chart") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  }
  if (icon === "book") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  if (icon === "zap") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ── Financial card ────────────────────────────────────────────────── */

function FinancialCard({ result, linkClass }: { result: SearchResult; linkClass: string }) {
  const metrics = extractMetrics(result.content);
  const tickers = extractTickers(result.content + " " + result.title);
  const snippet = result.content.length > 120 ? result.content.slice(0, 120).replace(/\s+\S*$/, "") + "..." : result.content;

  return (
    <div className="rounded-md border border-[--border-subtle] bg-[--surface-1] p-2.5 space-y-1.5">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {tickers.length > 0 && (
            <div className="flex gap-1 mb-1">
              {tickers.map((t) => (
                <span key={t} className="inline-block rounded bg-emerald-500/8 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-emerald-400/80 border border-emerald-500/10">
                  {t}
                </span>
              ))}
            </div>
          )}
          <a href={result.url} target="_blank" rel="noopener noreferrer" className={`text-xs font-medium leading-tight block truncate ${linkClass}`}>
            {result.title || result.url}
          </a>
        </div>
      </div>
      {metrics.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {metrics.map((m, i) => (
            <span key={i} className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold tabular-nums ${
              m.positive === true ? "bg-emerald-500/8 text-emerald-400 border border-emerald-500/15"
                : m.positive === false ? "bg-red-500/8 text-red-400 border border-red-500/15"
                  : "bg-[--surface-3] text-[--text-secondary] border border-[--border-subtle]"
            }`}>
              {m.positive === true && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>}
              {m.positive === false && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>}
              {m.value}
            </span>
          ))}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-[--text-quaternary] line-clamp-2">{snippet}</p>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────────── */

interface SearchResultsProps {
  activities: SearchActivity[];
  accentColor?: string;
}

export function SearchResults({ activities, accentColor }: SearchResultsProps) {
  if (activities.length === 0) return null;

  const textClass = accentColor ? ACCENT_TEXT[accentColor] ?? "text-white/50" : "text-white/50";
  const linkClass = accentColor ? ACCENT_LINK[accentColor] ?? "text-white/60 hover:underline" : "text-white/60 hover:underline";

  return (
    <div className="border-b border-[--border-subtle]">
      <div className="px-4 py-2.5 border-b border-[--border-subtle] flex items-center gap-2">
        <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[--text-quaternary]">
          Sources
        </span>
        <span className="text-[10px] font-mono text-[--text-quaternary]">
          {activities.filter((a) => a.status === "complete").length}
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto p-2.5 space-y-2">
        {activities.map((activity, i) => {
          const isFinancial = activity.tool_name === "search_financial";
          return (
            <div
              key={i}
              className={`rounded-md border border-[--border-subtle] bg-[--surface-0] p-2.5 text-sm transition-all duration-300 ${
                activity.status === "searching" ? "animate-shimmer" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-widest ${textClass}`}>
                  <ToolIcon type={activity.tool_name} />
                  {TOOL_LABELS[activity.tool_name] ?? activity.tool_name}
                </span>
                <span className="flex-1" />
                {activity.status === "searching" && (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400/70">
                    <span className="inline-block h-1 w-1 rounded-full bg-amber-400 animate-pulse-subtle" />
                    Searching
                  </span>
                )}
                {activity.status === "complete" && (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400/50">
                    <span className="inline-block h-1 w-1 rounded-full bg-emerald-400/50" />
                    Done
                  </span>
                )}
                {activity.status === "error" && (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-red-400/70">
                    <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                    Failed
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[--text-tertiary] mb-1.5 leading-relaxed">&ldquo;{activity.query}&rdquo;</p>

              {activity.results && activity.results.length > 0 && (
                <div className="space-y-1.5">
                  {isFinancial
                    ? activity.results.slice(0, 3).map((result, j) => (
                        <FinancialCard key={j} result={result} linkClass={linkClass} />
                      ))
                    : activity.results.slice(0, 3).map((result, j) => (
                        <div key={j} className="text-[11px] text-[--text-quaternary] flex items-center gap-1.5">
                          <span className="inline-block h-0.5 w-0.5 rounded-full bg-[--text-quaternary] shrink-0" />
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className={`truncate ${linkClass}`}>
                            {result.title || result.url}
                          </a>
                        </div>
                      ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
