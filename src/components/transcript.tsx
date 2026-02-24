"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

export interface TranscriptEntry {
  role: "replica" | "user";
  text: string;
  timestamp: number;
}

const ACCENT_BORDER: Record<string, string> = {
  emerald: "border-l-emerald-500/30",
  red: "border-l-red-500/30",
  violet: "border-l-violet-500/30",
};

interface TranscriptProps {
  entries: TranscriptEntry[];
  personaName?: string;
  accentColor?: string;
}

export function Transcript({ entries, personaName, accentColor }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const borderClass = accentColor ? ACCENT_BORDER[accentColor] ?? "border-l-white/10" : "border-l-white/10";

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-[--border-subtle] flex items-center gap-2">
        <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[--text-quaternary]">
          Transcript
        </span>
        {entries.length > 0 && (
          <span className="text-[10px] font-mono text-[--text-quaternary]">
            {entries.length}
          </span>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="rounded-full bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
              <MessageSquare size={18} className="text-[--text-quaternary]" />
            </div>
            <p className="text-[--text-quaternary] text-xs">
              Conversation will appear here...
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  entry.role === "user"
                    ? "glass text-white"
                    : `bg-[--surface-2] text-[--text-primary] border border-[--border-subtle] border-l-2 ${borderClass}`
                }`}
              >
                <span className={`block text-[10px] font-mono font-medium mb-0.5 ${
                  entry.role === "user" ? "text-white/40" : "text-[--text-tertiary]"
                }`}>
                  {entry.role === "user" ? "You" : personaName ?? "Assistant"}
                </span>
                {entry.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
