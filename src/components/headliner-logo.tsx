"use client";

import { motion } from "framer-motion";

interface HeadlinerLogoProps {
  height?: number;
  showWordmark?: boolean;
  animate?: boolean;
  className?: string;
}

const barVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

const wordmarkVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeadlinerLogo({
  height = 32,
  showWordmark = true,
  animate = true,
  className = "",
}: HeadlinerLogoProps) {
  const iconWidth = Math.round(height * (40 / 44));

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{ gap: Math.round(height * 0.3) }}
    >
      <motion.svg
        width={iconWidth}
        height={height}
        viewBox="0 0 40 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={animate ? "hidden" : false}
        animate={animate ? "visible" : false}
      >
        <motion.rect
          custom={0}
          variants={barVariants}
          x="3"
          y="14"
          width="9"
          height="28"
          rx="4.5"
          fill="#34d399"
        />
        <motion.rect
          custom={1}
          variants={barVariants}
          x="15.5"
          y="4"
          width="9"
          height="38"
          rx="4.5"
          fill="#f87171"
        />
        <motion.rect
          custom={2}
          variants={barVariants}
          x="28"
          y="20"
          width="9"
          height="22"
          rx="4.5"
          fill="#a78bfa"
        />
      </motion.svg>

      {showWordmark && (
        <motion.span
          variants={wordmarkVariants}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          className="font-bold tracking-[-0.04em] text-white"
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: Math.round(height * 0.7),
            lineHeight: 1,
          }}
        >
          Headliner
        </motion.span>
      )}
    </span>
  );
}
