"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CVIProvider } from "@/components/cvi/components/cvi-provider";
import { AvatarConversation } from "@/components/avatar-conversation";
import { useAuthStore } from "@/app/stores/auth-store";
import { isValyuMode } from "@/lib/app-mode";
import type { PersonaType } from "@/lib/personas";

function ConversationContent() {
  const searchParams = useSearchParams();
  const personaType = (searchParams.get("persona") ?? "financial-analyst") as PersonaType;
  const topic = searchParams.get("topic") ?? undefined;
  const paperUrl = searchParams.get("paper_url") ?? undefined;
  const watchlistRaw = searchParams.get("watchlist");
  const watchlist = watchlistRaw ? watchlistRaw.split(",") : undefined;
  const difficulty = searchParams.get("difficulty") ?? undefined;

  return (
    <AvatarConversation
      personaType={personaType}
      topic={topic}
      paperUrl={paperUrl}
      watchlist={watchlist}
      difficulty={difficulty}
    />
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, initialized, isLoading } = useAuthStore();
  const requiresAuth = isValyuMode();

  useEffect(() => {
    if (!requiresAuth) return;
    if (!initialized || isLoading) return;
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [requiresAuth, initialized, isLoading, isAuthenticated, router]);

  if (!requiresAuth) return <>{children}</>;
  if (!initialized || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
      </main>
    );
  }
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export default function ConversationPage() {
  return (
    <AuthGate>
      <CVIProvider>
        <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-gray-950">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
            </main>
          }
        >
          <ConversationContent />
        </Suspense>
      </CVIProvider>
    </AuthGate>
  );
}
