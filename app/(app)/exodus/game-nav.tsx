"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** `match` is an extra path prefix that also lights the tab up. */
type GameLink = { href: string; label: string; badge?: number; match?: string };

function isActive(pathname: string, { href, match }: GameLink) {
  if (match && pathname.startsWith(match)) return true;
  return href === "/exodus" ? pathname === "/exodus" : pathname.startsWith(href);
}

/** The game's own tabs, under the main app header. Scrolls sideways on narrow phones. */
export function GameNav({ links }: { links: GameLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1 rounded-2xl border border-line bg-night-900/70 p-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium whitespace-nowrap transition ${
              isActive(pathname, link)
                ? "bg-amber-400/15 text-amber-200"
                : "text-slate-400 hover:bg-wash hover:text-slate-100"
            }`}
          >
            {link.label}
            {link.badge ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-ink">
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
