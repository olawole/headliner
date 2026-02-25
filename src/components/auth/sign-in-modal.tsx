"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth-store";
import { initiateOAuthFlow, isOAuthConfigured } from "@/lib/oauth";
import { HeadlinerLogo } from "@/components/headliner-logo";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modal = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28, delay: 0.05 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

export function SignInModal() {
  const { showSignInModal, closeSignInModal } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);

    if (!isOAuthConfigured()) {
      setError("OAuth is not configured. Please set the required environment variables.");
      return;
    }

    try {
      setIsRedirecting(true);
      localStorage.setItem("oauth_return_url", window.location.href);
      await initiateOAuthFlow();
    } catch (err) {
      setIsRedirecting(false);
      setError(err instanceof Error ? err.message : "Failed to start sign-in.");
    }
  };

  return (
    <AnimatePresence>
      {showSignInModal && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop — heavy black scrim with strong blur to fully obscure the page */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={closeSignInModal}
          />

          {/* Modal */}
          <motion.div
            variants={modal}
            className="sign-in-modal relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/[0.1] p-8 text-center"
          >
            {/* Subtle top-edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Ambient accent glow behind modal (decorative) */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-primary/15 blur-[80px]" />

            {/* Close button */}
            <button
              onClick={closeSignInModal}
              className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors duration-150"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Headliner logo */}
            <div className="relative mx-auto mb-6">
              <HeadlinerLogo height={40} showWordmark={false} animate={true} />
            </div>

            <h2
              className="relative text-xl font-bold tracking-tight text-white mb-2"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Sign in to Headliner
            </h2>

            <p className="relative text-sm text-zinc-400 mb-7 leading-relaxed max-w-[300px] mx-auto">
              Talk face-to-face with 3 AI experts who analyze your portfolio, broadcast your news, and break down your research, all powered by real-time search from Valyu.
            </p>

            {error && (
              <div className="relative mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-left">
                {error}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isRedirecting}
              className="relative group flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-gray-950 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-zinc-100 hover:shadow-xl hover:shadow-black/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-950" />
                  Redirecting...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in with Valyu
                </>
              )}
            </button>

            <p className="relative mt-5 text-[11px] text-zinc-500">
              Don&apos;t have an account?{" "}
              <a
                href="https://platform.valyu.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors duration-150 underline underline-offset-2"
              >
                Create one during sign-in.
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
