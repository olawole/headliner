"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, List, Link2, X, ArrowRight, ArrowLeft, Zap, Clock, Users } from "lucide-react";
import {
  getPersonaConfig,
  DIFFICULTY_LABELS,
  type PersonaType,
  type SetupMode,
} from "@/lib/personas";
import { searchTickers, type TickerEntry } from "@/lib/tickers";
import { useAuthStore } from "@/app/stores/auth-store";
import { isValyuMode } from "@/lib/app-mode";
import { UserMenuInline } from "@/components/auth/user-menu";

/* ── Accent color system ──────────────────────────────────────────── */
const A = {
  emerald: {
    bg: "bg-emerald-500/8",
    bgSolid: "bg-emerald-500/15",
    border: "border-emerald-500/20",
    borderFocus: "focus-within:border-emerald-400/50",
    ring: "ring-emerald-500/10",
    btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30",
    btnGlow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.25)]",
    text: "text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    chipHover: "hover:bg-emerald-500/25",
    glow: "from-emerald-500/4 via-transparent to-transparent",
    activeTab: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dropdownHighlight: "bg-emerald-500/8",
    tickerBadge: "bg-emerald-500/10 border-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-400",
    glowOrb: "#34d399",
  },
  red: {
    bg: "bg-red-500/8",
    bgSolid: "bg-red-500/15",
    border: "border-red-500/20",
    borderFocus: "focus-within:border-red-400/50",
    ring: "ring-red-500/10",
    btn: "bg-red-600 hover:bg-red-500 shadow-red-900/30",
    btnGlow: "hover:shadow-[0_0_30px_rgba(248,113,113,0.25)]",
    text: "text-red-400",
    chip: "bg-red-500/10 text-red-300 border-red-500/20",
    chipHover: "hover:bg-red-500/25",
    glow: "from-red-500/4 via-transparent to-transparent",
    activeTab: "bg-red-500/15 text-red-300 border-red-500/30",
    dropdownHighlight: "bg-red-500/8",
    tickerBadge: "bg-red-500/10 border-red-500/15 text-red-400",
    dot: "bg-red-400",
    glowOrb: "#f87171",
  },
  violet: {
    bg: "bg-violet-500/8",
    bgSolid: "bg-violet-500/15",
    border: "border-violet-500/20",
    borderFocus: "focus-within:border-violet-400/50",
    ring: "ring-violet-500/10",
    btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-900/30",
    btnGlow: "hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]",
    text: "text-violet-400",
    chip: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    chipHover: "hover:bg-violet-500/25",
    glow: "from-violet-500/4 via-transparent to-transparent",
    activeTab: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    dropdownHighlight: "bg-violet-500/8",
    tickerBadge: "bg-violet-500/10 border-violet-500/15 text-violet-400",
    dot: "bg-violet-400",
    glowOrb: "#a78bfa",
  },
} as const;

type AccentKey = keyof typeof A;

const MODE_META: Record<SetupMode, { label: string; icon: React.ElementType }> = {
  topic: { label: "Topic", icon: Search },
  watchlist: { label: "Watchlist", icon: List },
  paper: { label: "Paper URL", icon: Link2 },
};

const DIFFICULTY_KEYS = ["general", "undergraduate", "graduate", "expert"];

const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  general: "Plain language, everyday analogies, no jargon.",
  undergraduate: "Basic technical terms with clear definitions.",
  graduate: "Technical terminology, detailed methodology.",
  expert: "Deep technical analysis — stats, limitations, methods.",
};

const PERSONA_CAPABILITIES: Record<string, string[]> = {
  "financial-analyst": [
    "Live stock prices & market trends",
    "Earnings reports & balance sheets",
    "SEC filings & insider activity",
    "Breaking financial news",
  ],
  "news-anchor": [
    "Real-time breaking news",
    "Multi-topic live briefings",
    "Source-cited reporting",
    "Deep-dive story context",
  ],
  "research-explainer": [
    "Academic paper search & analysis",
    "Plain-language breakdowns",
    "Methodology deep-dives",
    "Cross-referenced related work",
  ],
};

/* ── Persona-specific theming ────────────────────────────────────── */

const PERSONA_THEME: Record<string, {
  tagline: string;
  statusBadge: string;
  statusDot: string;
  tickerItems: string[];
  tickerSpeed: number;
  stats: { value: string; label: string }[];
}> = {
  "financial-analyst": {
    tagline: "Your personal Wall Street analyst",
    statusBadge: "MARKET OPEN",
    statusDot: "bg-emerald-400",
    tickerItems: ["NASDAQ", "NYSE", "S&P 500", "DOW", "FTSE 100", "DAX", "NIKKEI", "BTC", "ETH", "GOLD"],
    tickerSpeed: 25,
    stats: [
      { value: "Real-time", label: "Market Data" },
      { value: "SEC", label: "Filings" },
      { value: "24/7", label: "Coverage" },
    ],
  },
  "news-anchor": {
    tagline: "Your AI newsroom, always on",
    statusBadge: "ON AIR",
    statusDot: "bg-red-400",
    tickerItems: ["BREAKING", "WORLD", "POLITICS", "TECHNOLOGY", "SCIENCE", "BUSINESS", "HEALTH", "CLIMATE", "ECONOMY"],
    tickerSpeed: 20,
    stats: [
      { value: "Live", label: "Wire Feed" },
      { value: "Global", label: "Coverage" },
      { value: "Multi", label: "Sources" },
    ],
  },
  "research-explainer": {
    tagline: "Making complex research accessible",
    statusBadge: "LAB ACTIVE",
    statusDot: "bg-violet-400",
    tickerItems: ["arXiv", "PubMed", "Nature", "Science", "bioRxiv", "medRxiv", "Cell", "PNAS", "Lancet", "JAMA"],
    tickerSpeed: 30,
    stats: [
      { value: "Multi-DB", label: "Search" },
      { value: "Any", label: "Level" },
      { value: "Deep", label: "Analysis" },
    ],
  },
};

/* ── Animation variants ──────────────────────────────────────────── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 },
  },
};

/* ── Main setup content ────────────────────────────────────────────── */
function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personaType = (searchParams.get("persona") ?? "financial-analyst") as PersonaType;
  const persona = getPersonaConfig(personaType);

  const FORM_STORAGE_KEY = `headliner_setup_form_${personaType}`;

  const [activeMode, setActiveMode] = useState<SetupMode>("topic");
  const [topic, setTopic] = useState("");
  const [paperUrl, setPaperUrl] = useState("");
  const [tickers, setTickers] = useState<string[]>([]);
  const [tickerInput, setTickerInput] = useState("");
  const [suggestions, setSuggestions] = useState<TickerEntry[]>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [difficulty, setDifficulty] = useState("general");
  const [slotsAvailable, setSlotsAvailable] = useState(true);
  const [activeSlots, setActiveSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(3);
  const [isQueued, setIsQueued] = useState(false);
  const [queueReady, setQueueReady] = useState(false);
  const tickerInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const queuePollRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Poll slot availability every 10s ────────────────────────────── */
  const checkAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/conversation/availability");
      const data = await res.json();
      setSlotsAvailable(data.available);
      setActiveSlots(data.active);
      setMaxSlots(data.max);
      return data.available as boolean;
    } catch {
      // On error, assume available
      setSlotsAvailable(true);
      return true;
    }
  }, []);

  useEffect(() => {
    checkAvailability();
    const interval = setInterval(checkAvailability, 10_000);
    return () => clearInterval(interval);
  }, [checkAvailability]);

  /* ── Queue mode: poll faster and auto-navigate when slot opens ──── */
  useEffect(() => {
    if (!isQueued) return;
    queuePollRef.current = setInterval(async () => {
      const available = await checkAvailability();
      if (available) {
        setQueueReady(true);
        if (queuePollRef.current) clearInterval(queuePollRef.current);
      }
    }, 8_000);
    return () => {
      if (queuePollRef.current) clearInterval(queuePollRef.current);
    };
  }, [isQueued, checkAvailability]);

  // Restore form state saved before auth redirect
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.activeMode) setActiveMode(data.activeMode);
      if (data.topic) setTopic(data.topic);
      if (data.paperUrl) setPaperUrl(data.paperUrl);
      if (data.tickers?.length) setTickers(data.tickers);
      if (data.difficulty) setDifficulty(data.difficulty);
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [FORM_STORAGE_KEY]);

  useEffect(() => {
    if (tickerInput.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const matches = searchTickers(tickerInput, 6).filter(
      (t) => !tickers.includes(t.ticker)
    );
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setHighlightIdx(-1);
  }, [tickerInput, tickers]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        tickerInputRef.current &&
        !tickerInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!persona) {
    router.push("/");
    return null;
  }

  const { isAuthenticated, openSignInModal } = useAuthStore();
  const isValyu = isValyuMode();

  const c = A[persona.accentColor as AccentKey] ?? A.emerald;
  const modes = persona.setupModes;
  const capabilities = PERSONA_CAPABILITIES[personaType] ?? [];
  const theme = PERSONA_THEME[personaType] ?? PERSONA_THEME["financial-analyst"];

  const addTicker = useCallback(
    (ticker: string) => {
      const cleaned = ticker.toUpperCase().replace(/[^A-Z0-9.]/g, "").trim();
      if (cleaned && !tickers.includes(cleaned) && tickers.length < 10) {
        setTickers((prev) => [...prev, cleaned]);
      }
      setTickerInput("");
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightIdx(-1);
      tickerInputRef.current?.focus();
    },
    [tickers]
  );

  const removeTicker = useCallback((ticker: string) => {
    setTickers((prev) => prev.filter((t) => t !== ticker));
  }, []);

  const handleTickerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if ((e.key === "Enter" || e.key === "Tab") && highlightIdx >= 0) {
        e.preventDefault();
        addTicker(suggestions[highlightIdx].ticker);
        return;
      }
    }
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tickerInput.trim()) addTicker(tickerInput);
    }
    if (e.key === "Backspace" && tickerInput === "" && tickers.length > 0) {
      removeTicker(tickers[tickers.length - 1]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const navigateToConversation = useCallback(() => {
    const params = new URLSearchParams({ persona: personaType });
    if (activeMode === "topic" && topic.trim()) {
      params.set("topic", topic.trim());
    } else if (activeMode === "paper" && paperUrl.trim()) {
      params.set("paper_url", paperUrl.trim());
    } else if (activeMode === "watchlist" && tickers.length > 0) {
      params.set("watchlist", tickers.join(","));
    }
    if (persona.hasDifficulty && difficulty !== "general") {
      params.set("difficulty", difficulty);
    }
    localStorage.removeItem(FORM_STORAGE_KEY);
    router.push(`/conversation?${params.toString()}`);
  }, [personaType, activeMode, topic, paperUrl, tickers, persona.hasDifficulty, difficulty, FORM_STORAGE_KEY, router]);

  /* ── Auto-navigate when queue slot becomes available ──────────── */
  useEffect(() => {
    if (queueReady && isQueued) {
      const timer = setTimeout(navigateToConversation, 1000);
      return () => clearTimeout(timer);
    }
  }, [queueReady, isQueued, navigateToConversation]);

  const handleStart = () => {
    // In valyu mode, require authentication before starting
    if (isValyu && !isAuthenticated) {
      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({ activeMode, topic, paperUrl, tickers, difficulty })
      );
      openSignInModal();
      return;
    }

    // If slots are full, enter queue mode instead of navigating
    if (!slotsAvailable) {
      setIsQueued(true);
      return;
    }

    navigateToConversation();
  };

  const canStart =
    activeMode === "topic" ||
    (activeMode === "paper" && paperUrl.trim().length > 0) ||
    (activeMode === "watchlist" && tickers.length > 0);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Background ────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-neural-mesh opacity-50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* Persona-colored glow orb */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute h-[500px] w-[500px] rounded-full opacity-[0.06] blur-[140px] animate-float"
          style={{ background: c.glowOrb, top: "10%", left: "5%", animationDelay: "0s" }}
        />
        <div
          className="absolute h-[350px] w-[350px] rounded-full opacity-[0.04] blur-[100px] animate-float"
          style={{ background: c.glowOrb, bottom: "10%", right: "10%", animationDelay: "-5s" }}
        />
      </div>

      <div className="scanlines" />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 min-h-screen flex flex-col"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex items-center justify-between py-6 sm:py-8">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              <ArrowLeft size={14} />
            </span>
            Back
          </button>
          <UserMenuInline />
        </motion.div>

        {/* ── Split layout ────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center py-6 sm:py-10">

          {/* ── Left: Persona showcase ────────────────────────── */}
          <motion.div className="lg:col-span-5 space-y-7" variants={slideLeft}>
            {/* Status badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] glass px-3 py-1.5 text-[10px] font-mono font-semibold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${theme.statusDot} opacity-50`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${theme.statusDot}`} />
                </span>
                <span className={c.text}>{theme.statusBadge}</span>
              </span>
            </motion.div>

            {/* Large persona icon + name */}
            <div className="space-y-5">
              <div
                className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl text-5xl ${c.bg} ring-1 ring-white/[0.06]`}
              >
                {persona.icon}
              </div>

              <div>
                <h1
                  className="text-4xl sm:text-5xl font-bold tracking-[-0.04em] text-white leading-[0.95]"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  {persona.name}
                </h1>
                <p className="mt-2 text-sm text-zinc-500 font-mono tracking-wide">
                  {theme.tagline}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-8">
              {theme.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-lg font-bold text-white font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-600 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Scrolling ticker tape */}
            <div className="overflow-hidden rounded-lg border border-white/[0.04] bg-white/[0.01] py-2">
              <div
                className="flex gap-6 whitespace-nowrap"
                style={{ animation: `ticker-scroll ${theme.tickerSpeed}s linear infinite` }}
              >
                {[...theme.tickerItems, ...theme.tickerItems].map((item, i) => (
                  <span key={`${item}-${i}`} className="flex items-center gap-2">
                    <span className={`h-1 w-1 rounded-full ${c.dot} opacity-40`} />
                    <span className={`text-[10px] font-mono font-medium tracking-wider uppercase ${i < theme.tickerItems.length ? "text-zinc-500" : "text-zinc-500"}`}>
                      {item}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Decorative separator */}
            <div className="flex items-center gap-3">
              <div className="h-px w-12" style={{ background: `linear-gradient(to right, ${c.glowOrb}40, transparent)` }} />
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
                Capabilities
              </span>
            </div>

            {/* Capability list */}
            <div className="space-y-3">
              {capabilities.map((cap) => (
                <motion.div
                  key={cap}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                  <span className="text-sm text-zinc-400">{cap}</span>
                </motion.div>
              ))}
            </div>

            {/* Tool badges */}
            <div className="flex flex-wrap gap-1.5">
              {persona.tools.map((tool) => (
                <span
                  key={tool.function.name}
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-mono font-medium tracking-wider uppercase ${c.bg} ${c.text} ring-1 ring-inset ring-white/[0.06]`}
                >
                  {tool.function.name.replace("search_", "")}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Form panel ─────────────────────────────── */}
          <motion.div className="lg:col-span-7" variants={slideRight}>
            <div className="glass rounded-2xl border border-white/[0.06] p-6 sm:p-8 space-y-6">

              {/* Mode tabs */}
              {modes.length > 1 && (
                <div className="flex gap-1 rounded-lg bg-white/[0.02] border border-white/[0.04] p-1">
                  {modes.map((mode) => {
                    const active = activeMode === mode;
                    const meta = MODE_META[mode];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={mode}
                        onClick={() => setActiveMode(mode)}
                        className={`relative flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                          active
                            ? `${c.activeTab} border`
                            : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                        }`}
                      >
                        <Icon size={14} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Input area */}
              <div className="space-y-5">
                <AnimatePresence mode="wait">
                  {/* Topic input */}
                  {activeMode === "topic" && (
                    <motion.div
                      key="topic"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5"
                    >
                      <label className={`block text-xs font-mono font-medium tracking-wider uppercase ${c.text}`}>
                        {persona.topicLabel}
                      </label>
                      <div className={`rounded-lg border ${c.border} ${c.borderFocus} bg-white/[0.02] transition-colors duration-200`}>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder={persona.topicPlaceholder}
                          onKeyDown={(e) => e.key === "Enter" && handleStart()}
                          className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Brief the avatar on a specific topic, or leave blank for an open conversation.
                      </p>
                    </motion.div>
                  )}

                  {/* Paper URL */}
                  {activeMode === "paper" && (
                    <motion.div
                      key="paper"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5"
                    >
                      <label className={`block text-xs font-mono font-medium tracking-wider uppercase ${c.text}`}>
                        Paper URL
                      </label>
                      <div className={`flex items-center gap-3 rounded-lg border ${c.border} ${c.borderFocus} bg-white/[0.02] px-4 transition-colors duration-200`}>
                        <Link2 size={14} className="text-zinc-600 shrink-0" />
                        <input
                          type="url"
                          value={paperUrl}
                          onChange={(e) => setPaperUrl(e.target.value)}
                          placeholder="https://arxiv.org/abs/2401.12345"
                          onKeyDown={(e) => e.key === "Enter" && canStart && handleStart()}
                          className="w-full bg-transparent py-3.5 text-sm text-white placeholder-zinc-600 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Paste an arXiv, PubMed, or any paper URL. The explainer will walk you through it.
                      </p>
                    </motion.div>
                  )}

                  {/* Watchlist */}
                  {activeMode === "watchlist" && (
                    <motion.div
                      key="watchlist"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5"
                    >
                      <label className={`block text-xs font-mono font-medium tracking-wider uppercase ${c.text}`}>
                        Portfolio Watchlist
                      </label>
                      <div className="relative">
                        <div
                          className={`rounded-lg border ${c.border} ${c.borderFocus} bg-white/[0.02] transition-colors duration-200`}
                          onClick={() => tickerInputRef.current?.focus()}
                        >
                          <div className="flex flex-wrap items-center gap-1.5 p-3">
                            {tickers.map((ticker) => (
                              <motion.span
                                key={ticker}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`group inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-mono font-bold tracking-wider ${c.chip} transition-colors`}
                              >
                                {ticker}
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeTicker(ticker); }}
                                  className={`rounded p-0.5 opacity-40 hover:opacity-100 ${c.chipHover} transition-all`}
                                >
                                  <X size={10} />
                                </button>
                              </motion.span>
                            ))}
                            <input
                              ref={tickerInputRef}
                              type="text"
                              value={tickerInput}
                              onChange={(e) => setTickerInput(e.target.value)}
                              onKeyDown={handleTickerKeyDown}
                              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                              placeholder={tickers.length === 0 ? "Search company or ticker..." : tickers.length < 10 ? "Add more..." : ""}
                              disabled={tickers.length >= 10}
                              className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-white placeholder-zinc-600 outline-none"
                            />
                          </div>
                        </div>

                        {/* Autocomplete dropdown */}
                        <AnimatePresence>
                          {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                              ref={suggestionsRef}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-lg border border-white/[0.1] glass-elevated overflow-hidden"
                            >
                              {suggestions.map((entry, idx) => (
                                <button
                                  key={entry.ticker}
                                  onMouseDown={(e) => { e.preventDefault(); addTicker(entry.ticker); }}
                                  onMouseEnter={() => setHighlightIdx(idx)}
                                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 ${
                                    idx === highlightIdx ? c.dropdownHighlight : "hover:bg-white/[0.03]"
                                  }`}
                                >
                                  <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider ${c.tickerBadge}`}>
                                    {entry.ticker}
                                  </span>
                                  <span className="flex-1 truncate text-sm text-zinc-400">
                                    {entry.name}
                                  </span>
                                  {entry.sector && (
                                    <span className="shrink-0 text-[10px] font-mono text-zinc-600 tracking-wide">
                                      {entry.sector}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-zinc-600">
                          Type a company name or ticker. Arrow keys to navigate.
                        </p>
                        {tickers.length > 0 && (
                          <span className={`text-[11px] font-mono ${c.text}`}>
                            {tickers.length}/10
                          </span>
                        )}
                      </div>
                      {/* Quick-add */}
                      {tickers.length === 0 && !showSuggestions && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            { ticker: "NVDA", name: "NVIDIA" },
                            { ticker: "AAPL", name: "Apple" },
                            { ticker: "TSLA", name: "Tesla" },
                            { ticker: "MSFT", name: "Microsoft" },
                            { ticker: "GOOGL", name: "Alphabet" },
                          ].map((t) => (
                            <button
                              key={t.ticker}
                              onClick={() => addTicker(t.ticker)}
                              className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.1] transition-colors"
                            >
                              <span className="font-mono font-bold tracking-wider">{t.ticker}</span>
                              <span className="text-zinc-600">{t.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Difficulty */}
                {persona.hasDifficulty && (
                  <div className="space-y-2.5">
                    <label className={`block text-xs font-mono font-medium tracking-wider uppercase ${c.text}`}>
                      Explanation depth
                    </label>
                    <div className="grid grid-cols-4 gap-1 rounded-lg bg-white/[0.02] border border-white/[0.04] p-1">
                      {DIFFICULTY_KEYS.map((key) => {
                        const active = difficulty === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setDifficulty(key)}
                            className={`rounded-md px-1.5 py-2 text-[11px] font-medium transition-all duration-200 ${
                              active
                                ? `${c.activeTab} border`
                                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                            }`}
                          >
                            {DIFFICULTY_LABELS[key]}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-zinc-600">
                      {DIFFICULTY_DESCRIPTIONS[difficulty]}
                    </p>
                  </div>
                )}
              </div>

              {/* Start / Queue button */}
              <AnimatePresence mode="wait">
                {isQueued ? (
                  queueReady ? (
                    /* Slot opened — green flash → auto-navigate */
                    <motion.div
                      key="queue-ready"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex w-full flex-col items-center gap-3 rounded-xl bg-emerald-600 px-6 py-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Zap size={16} />
                        Slot available — starting now!
                      </div>
                      <div className="h-1 w-24 overflow-hidden rounded-full bg-emerald-400/30">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    /* In queue — waiting for a slot */
                    <motion.div
                      key="queue-waiting"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex w-full items-center justify-center gap-3 rounded-xl bg-amber-600/20 border border-amber-500/20 px-6 py-4">
                        <div className="relative flex h-5 w-5 items-center justify-center">
                          <div
                            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400"
                            style={{ animation: "ring-rotate 1.5s linear infinite" }}
                          />
                        </div>
                        <span className="text-sm font-medium text-amber-300">
                          Waiting for an expert to become available
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[11px] text-amber-400/60 font-mono">
                          {activeSlots}/{maxSlots} experts live — checking every 8s
                        </p>
                        <button
                          onClick={() => setIsQueued(false)}
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )
                ) : (
                  /* Normal start button */
                  <motion.button
                    key="start-btn"
                    onClick={handleStart}
                    disabled={!canStart}
                    whileHover={canStart ? { scale: 1.01 } : undefined}
                    whileTap={canStart ? { scale: 0.98 } : undefined}
                    className={`group flex w-full items-center justify-center gap-3 rounded-xl ${
                      !slotsAvailable
                        ? "bg-amber-600/80 hover:bg-amber-500/80 shadow-amber-900/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                        : `${c.btn} ${c.btnGlow}`
                    } px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {!slotsAvailable ? (
                      <>
                        <Clock size={16} className="opacity-70" />
                        Join Queue
                        <Users size={14} className="opacity-50" />
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="opacity-70" />
                        Start Conversation
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0" />
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Slot availability indicator */}
              {!isQueued && (
                <div className="flex items-center justify-center gap-2">
                  {activeMode === "topic" && slotsAvailable && (
                    <p className="text-[11px] text-zinc-600">
                      You can also start without a topic for a free-form conversation
                    </p>
                  )}
                  {!slotsAvailable && (
                    <p className="text-center text-[11px] text-amber-400/60 flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </span>
                      All {maxSlots} experts are live — you&apos;ll queue and auto-start when one opens
                    </p>
                  )}
                  {slotsAvailable && maxSlots - activeSlots < maxSlots && (
                    <p className="text-center text-[11px] text-zinc-600 flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      {maxSlots - activeSlots} of {maxSlots} {maxSlots - activeSlots === 1 ? "slot" : "slots"} open
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-white/[0.08] border-t-white/40" />
        </main>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
