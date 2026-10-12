"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const KEY = "tent-alert-dismissed";

// The dismissed signature lives in sessionStorage, so "Later" lasts until the
// tab closes, and anything new (a different signature) brings the banner back.
const listeners = new Set<() => void>();
function readDismissed() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function dismiss(signature: string) {
  try {
    sessionStorage.setItem(KEY, signature);
  } catch {
    // Private mode or blocked storage: the banner just hides until the next page.
  }
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Shows the tent alert unless it was dismissed for this exact state, or the
 * page already shows what it's about: `hideUnder` hides on a path and
 * everything below it, `hideAt` on that exact path only.
 */
export function TentAlertShell({
  signature,
  hideUnder,
  hideAt = [],
  children,
}: {
  signature: string;
  hideUnder: string[];
  hideAt?: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => null);
  const shownHere =
    hideAt.includes(pathname) || hideUnder.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (dismissed === signature || shownHere) return null;

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={() => dismiss(signature)}
        className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center text-slate-500 hover:text-slate-200 sm:right-3"
        aria-label="Hide for now"
        title="Hide for now"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
