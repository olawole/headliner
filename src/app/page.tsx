"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { PERSONAS } from "@/lib/personas";
import { UserMenuInline } from "@/components/auth/user-menu";
import { HeadlinerLogo } from "@/components/headliner-logo";

/* ── Accent style maps ────────────────────────────────────────────── */

const ACCENT_STYLES: Record<
  string,
  {
    border: string;
    hoverBorder: string;
    bg: string;
    text: string;
    gradientFrom: string;
    glowClass: string;
    dot: string;
  }
> = {
  emerald: {
    border: "border-emerald-500/10",
    hoverBorder: "group-hover:border-emerald-400/30",
    bg: "bg-emerald-500/8",
    text: "text-emerald-400",
    gradientFrom: "from-emerald-500/5",
    glowClass: "glow-emerald",
    dot: "bg-emerald-400",
  },
  red: {
    border: "border-red-500/10",
    hoverBorder: "group-hover:border-red-400/30",
    bg: "bg-red-500/8",
    text: "text-red-400",
    gradientFrom: "from-red-500/5",
    glowClass: "glow-red",
    dot: "bg-red-400",
  },
  violet: {
    border: "border-violet-500/10",
    hoverBorder: "group-hover:border-violet-400/30",
    bg: "bg-violet-500/8",
    text: "text-violet-400",
    gradientFrom: "from-violet-500/5",
    glowClass: "glow-violet",
    dot: "bg-violet-400",
  },
};

/* ── Framer Motion variants ──────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const heroSlide = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.35 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const personas = Object.values(PERSONAS);

export default function HomePage() {
  const [featured, ...rest] = personas;
  const fs = ACCENT_STYLES[featured.accentColor] ?? ACCENT_STYLES.emerald;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Background layers ──────────────────────────────────── */}
      <div className="absolute inset-0 bg-neural-mesh" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Ambient orbs — oversized for drama */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute h-[600px] w-[600px] rounded-full opacity-[0.04] blur-[150px] animate-float"
          style={{ background: "#34d399", top: "-5%", left: "-10%", animationDelay: "0s" }}
        />
        <div
          className="absolute h-[500px] w-[500px] rounded-full opacity-[0.06] blur-[120px] animate-float"
          style={{ background: "#a78bfa", top: "35%", right: "-8%", animationDelay: "-4s" }}
        />
        <div
          className="absolute h-[350px] w-[350px] rounded-full opacity-[0.04] blur-[100px] animate-float"
          style={{ background: "#f87171", bottom: "-5%", left: "25%", animationDelay: "-7s" }}
        />
      </div>

      <div className="scanlines" />

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 min-h-screen flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <motion.header
          variants={fadeUp}
          className="flex items-center justify-between py-6 sm:py-8"
        >
          <a
            href="https://discord.gg/NjEQUzJjmc"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] glass px-4 py-2 text-sm text-white/80 hover:text-white hover:border-white/[0.12] transition-all duration-200"
          >
            <svg width="18" height="14" viewBox="0 0 71 55" fill="none" className="text-[#5865F2]">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.2a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.4 37.4 0 0 0 25.4.3a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.5 5a.2.2 0 0 0-.1 0C1.5 17.2-.9 29.1.3 40.8v.1a58.7 58.7 0 0 0 17.7 9a.2.2 0 0 0 .3-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.9a.2.2 0 0 1 .2 0 41.9 41.9 0 0 0 35.6 0 .2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .3 36.3 36.3 0 0 1-5.5 2.7.2.2 0 0 0-.1.3 47.2 47.2 0 0 0 3.6 5.8.2.2 0 0 0 .3.1A58.5 58.5 0 0 0 70.4 41v-.2C72 27.5 68 15.6 60.2 5a.2.2 0 0 0-.1 0ZM23.7 33.5c-3.2 0-5.8-2.9-5.8-6.5s2.6-6.5 5.8-6.5 5.9 3 5.8 6.5c0 3.6-2.6 6.5-5.8 6.5Zm21.4 0c-3.2 0-5.8-2.9-5.8-6.5s2.6-6.5 5.8-6.5 5.9 3 5.8 6.5c0 3.6-2.5 6.5-5.8 6.5Z" fill="currentColor"/>
            </svg>
            Join our Discord community
            <button
              className="ml-1 rounded-full p-0.5 text-white/30 hover:text-white/60 transition-colors"
              onClick={(e) => e.preventDefault()}
              aria-label="Dismiss"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/unicodeveloper/headliner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/[0.06] glass h-10 w-10 text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all duration-200"
              aria-label="View on GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 98 96" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
              </svg>
            </a>
            <UserMenuInline />
          </div>
        </motion.header>

        {/* ── Main: asymmetric split ──────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center py-6 sm:py-10">

          {/* ── Left: Hero typography ─────────────────────────── */}
          <motion.div className="lg:col-span-5 space-y-8" variants={heroSlide}>
            {/* Logo + Headline */}
            <div className="space-y-5">
              <div className="flex flex-col gap-5">
                <HeadlinerLogo height={48} showWordmark={false} />
                <h1
                  className="text-6xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold tracking-[-0.05em] text-white leading-[0.88]"
                  style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                >
                  Headliner
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1.5 mb-2 animate-pulse-subtle" />
                </h1>
              </div>

              {/* Decorative separator */}
              <div className="flex items-center gap-3">
                <div className="h-px w-16 bg-gradient-to-r from-white/20 to-transparent" />
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
                  AI Live Intelligence
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base text-zinc-400 leading-relaxed max-w-sm">
              Choose your AI expert. Start a face-to-face conversation
              powered by real-time data and live search.
            </p>

            {/* Stats row */}
            <div className="flex gap-10 pt-2">
              {[
                { value: "3", label: "Experts" },
                { value: "Live", label: "Data" },
                { value: "F2F", label: "Video" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-bold text-white font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-600 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Bento persona cards ────────────────────── */}
          <motion.div className="lg:col-span-7" variants={cardContainerVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Featured card — full width, horizontal */}
              <motion.div
                variants={cardVariants}
                className="sm:col-span-2"
                whileHover={{
                  y: -6,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
              >
                <Link
                  href={`/conversation/setup?persona=${featured.id}`}
                  className={`group relative flex flex-col sm:flex-row rounded-2xl border ${fs.border} ${fs.hoverBorder} glass p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${fs.gradientFrom} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5 w-full">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${fs.bg} ring-1 ring-white/[0.06]`}
                    >
                      {featured.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-white tracking-tight">
                          {featured.name}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider ${fs.bg} ${fs.text} ring-1 ring-inset ring-white/[0.06]`}
                        >
                          Featured
                        </span>
                      </div>

                      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                        {featured.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {featured.tools.map((tool) => (
                          <span
                            key={tool.function.name}
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider uppercase ${fs.bg} ${fs.text} ring-1 ring-inset ring-white/[0.06]`}
                          >
                            {tool.function.name.replace("search_", "")}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center self-center ml-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${fs.bg} text-white/0 group-hover:text-white/60 transition-all duration-300 group-hover:translate-x-1 ring-1 ring-white/[0.06]`}
                      >
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Remaining persona cards — two columns */}
              {rest.map((persona) => {
                const s = ACCENT_STYLES[persona.accentColor] ?? ACCENT_STYLES.emerald;
                return (
                  <motion.div
                    key={persona.id}
                    variants={cardVariants}
                    whileHover={{
                      y: -4,
                      transition: { type: "spring", stiffness: 400, damping: 25 },
                    }}
                  >
                    <Link
                      href={`/conversation/setup?persona=${persona.id}`}
                      className={`group relative flex flex-col rounded-2xl border ${s.border} ${s.hoverBorder} glass p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 h-full`}
                    >
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${s.gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                      />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${s.bg} ring-1 ring-white/[0.06]`}
                          >
                            {persona.icon}
                          </div>
                          <div className="text-white/0 group-hover:text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            <ArrowUpRight size={16} />
                          </div>
                        </div>

                        <h2 className="text-lg font-semibold text-white mb-2 tracking-tight">
                          {persona.name}
                        </h2>

                        <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                          {persona.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {persona.tools.map((tool) => (
                            <span
                              key={tool.function.name}
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider uppercase ${s.bg} ${s.text} ring-1 ring-inset ring-white/[0.06]`}
                            >
                              {tool.function.name.replace("search_", "")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <motion.footer variants={fadeUp} className="py-6 sm:py-8 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 tracking-wider">
            <Sparkles size={12} className="text-zinc-600" />
            Built with ❤️. Powered by{" "}
            <a href="https://www.valyu.ai" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Valyu Search</a>
            {" & "}
            <a href="https://www.tavus.io" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Tavus</a>
          </p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
