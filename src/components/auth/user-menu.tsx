"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth-store";
import { isValyuMode } from "@/lib/app-mode";

export function UserAvatar({
  src,
  name,
  email,
  size = "sm",
}: {
  src?: string;
  name: string;
  email: string;
  size?: "sm" | "md";
}) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email?.[0]?.toUpperCase() || "?";

  const sizeClasses = size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs";

  if (src && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || email}
        onError={() => setImgError(true)}
        className={`${sizeClasses} rounded-full object-cover ring-1 ring-white/[0.1]`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClasses} items-center justify-center rounded-full bg-white/[0.08] font-bold tracking-wide text-white ring-1 ring-white/[0.1]`}
    >
      {initials}
    </span>
  );
}

/** Dropdown menu content — shared between fixed and inline variants */
function UserDropdown({
  open,
  onClose,
  dropdownPosition = "below",
}: {
  open: boolean;
  onClose: () => void;
  dropdownPosition?: "below" | "below-left";
}) {
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  const positionClass =
    dropdownPosition === "below-left"
      ? "absolute left-0 top-full mt-2"
      : "absolute right-0 top-full mt-2";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={`${positionClass} w-64 rounded-xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl p-1 shadow-2xl z-40`}
        >
          <div className="px-3 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <UserAvatar src={user.picture} name={user.name} email={user.email} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-zinc-500">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors mt-1"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Fixed-position user menu — hides on /conversation page */
export function UserMenu() {
  const { isAuthenticated, user, initialized, openSignInModal } =
    useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!initialized) return null;
  if (!isValyuMode()) return null;

  // Pages with their own header use UserMenuInline instead
  const pagesWithInlineMenu = ["/", "/conversation", "/conversation/setup"];
  if (pagesWithInlineMenu.includes(pathname)) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="fixed top-5 right-5 z-40">
        <button
          onClick={openSignInModal}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] glass px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all duration-200"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-5 right-5 z-40" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] glass pl-1.5 pr-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:border-white/[0.12] transition-all duration-200"
      >
        <UserAvatar src={user.picture} name={user.name} email={user.email} size="sm" />
        <span className="max-w-[120px] truncate text-xs font-medium hidden sm:block">
          {user.name || user.email}
        </span>
        <ChevronDown
          size={12}
          className={`text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <UserDropdown open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** Compact inline user menu — for embedding in the conversation sidebar header */
export function UserMenuInline() {
  const { isAuthenticated, user, initialized } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!initialized || !isValyuMode() || !isAuthenticated || !user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-full hover:bg-white/[0.05] transition-colors p-0.5"
        title={user.name || user.email}
      >
        <UserAvatar src={user.picture} name={user.name} email={user.email} size="sm" />
      </button>
      <UserDropdown open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
