"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CountBadge } from "@/components/nav-links";

/**
 * `match` is an extra path prefix that also lights the tab up. `exact` lights
 * it only on its own page, for a game's home tab.
 */
type GameLink = { href: string; label: string; badge?: number; match?: string; exact?: boolean };

function isActive(pathname: string, { href, match, exact }: GameLink) {
  if (match && pathname.startsWith(match)) return true;
  return exact || href === "/exodus" ? pathname === href : pathname.startsWith(href);
}

/** The game's own tabs, under the main app header. Scrolls sideways on narrow phones. */
export function GameNav({ links }: { links: GameLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 mb-7 overflow-x-auto border-b border-[var(--ex-rule)] px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1">
        {links.map((link) => {
          const active = isActive(pathname, link);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex min-h-11 items-center gap-2 px-3.5 font-display text-[15px] whitespace-nowrap transition ${
                active ? "font-semibold text-[var(--ex-gold)]" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {link.label}
              {link.badge ? <CountBadge count={link.badge} className="font-sans" /> : null}
              {active && (
                <span className="absolute inset-x-2 -bottom-px flex items-center justify-center" aria-hidden>
                  <span className="h-0.5 flex-1 bg-[var(--ex-gold)]" />
                  <span className="mx-1 size-1.5 rotate-45 bg-[var(--ex-gold)]" />
                  <span className="h-0.5 flex-1 bg-[var(--ex-gold)]" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
