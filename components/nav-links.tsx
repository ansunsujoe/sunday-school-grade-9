"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavIcon, type NavIconName } from "./nav-icons";

/** `match` lists other path prefixes that belong to the same tab. */
type NavLink = {
  href: string;
  label: string;
  icon: NavIconName;
  more?: boolean;
  match?: readonly string[];
};

/**
 * A count of things waiting, with a soft pulse so it catches the eye. The
 * pulse stops for anyone who prefers reduced motion. Position it with a
 * wrapper; `className` adds to the badge's own layout.
 */
export function CountBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span className={`relative inline-grid ${className}`} aria-label={`${count} waiting`}>
      <span className="absolute inset-0 rounded-full bg-amber-400 opacity-60 motion-safe:animate-ping" aria-hidden />
      <span className="relative grid h-4.5 min-w-4.5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] leading-none font-bold text-ink ring-2 ring-night-950">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  );
}

function isActive(pathname: string, { href, match }: Pick<NavLink, "href" | "match">) {
  if (match?.some((m) => pathname.startsWith(m))) return true;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Inline nav for tablets and up. */
export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-1 md:flex">
      {links.map(({ href, label, match }) => (
        <Link
          key={href}
          href={href}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            isActive(pathname, { href, match })
              ? "bg-amber-400/10 text-amber-200"
              : "text-slate-400 hover:bg-wash hover:text-slate-100"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * The tab bar pinned to the bottom of the screen on phones: a gold diamond
 * slides along the top rule to the open tab, whose icon fills in over a soft
 * gold pill. Links marked `more` open from a sheet.
 */
export function TabBar({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const primary = links.filter((l) => !l.more);
  const extra = links.filter((l) => l.more);
  const extraActive = extra.some((l) => isActive(pathname, l));

  // Close the sheet whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const slots = primary.length + (extra.length > 0 ? 1 : 0);
  const activeIndex =
    open || extraActive ? primary.length : primary.findIndex((l) => isActive(pathname, l));

  return (
    <div className="md:hidden">
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="nav-fade fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]"
          />
          {/* .ex-panel sets its own position, so the sheet floats from a wrapper. */}
          <div
            id="more-sheet"
            className="nav-sheet fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40"
          >
            <ul className="ex-panel grid grid-cols-2 gap-1 p-2">
              {extra.map(({ href, label, icon, match }, i) => {
                const active = isActive(pathname, { href, match });
                return (
                  <li key={href} className="nav-rise" style={{ animationDelay: `${40 + i * 40}ms` }}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 text-[15px] transition active:bg-wash ${
                        active ? "text-[var(--ex-gold)]" : "text-slate-200"
                      }`}
                    >
                      <NavIcon name={icon} active={active} className="size-6 shrink-0" />
                      <span className="leading-tight font-medium">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ex-rule)] bg-night-950/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-md">
          {/*
            The diamond that slides to the open tab, centred on the gold rule
            above: 9px tall from 5px up puts its middle on the 1px border.
          */}
          {activeIndex >= 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[5px] flex h-[9px] items-center justify-center transition-[left] duration-300 ease-out"
              style={{ left: `${(activeIndex * 100) / slots}%`, width: `${100 / slots}%` }}
            >
              <span className="h-px w-6 bg-linear-to-r from-transparent to-[var(--ex-gold)]" />
              <span className="size-[7px] rotate-45 bg-[var(--ex-gold)] shadow-[0_0_8px] shadow-amber-400/60" />
              <span className="h-px w-6 bg-linear-to-l from-transparent to-[var(--ex-gold)]" />
            </span>
          )}
          {primary.map(({ href, label, icon, match }) => (
            <Tab
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={!open && isActive(pathname, { href, match })}
            />
          ))}
          {extra.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="more-sheet"
              className={`${tabClass} ${open || extraActive ? "text-[var(--ex-gold)]" : "text-slate-500"}`}
            >
              <TabIcon name={open ? "close" : "more"} active={open || extraActive} />
              More
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

const tabClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition active:scale-95";

/** The tab's icon over a soft gold pill that grows in when the tab opens. */
function TabIcon({ name, active }: { name: NavIconName; active: boolean }) {
  return (
    <span className="relative grid h-8 w-14 place-items-center">
      <span
        aria-hidden
        className={`absolute inset-0 rounded-full bg-amber-400/12 transition duration-300 ease-out ${
          active ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      />
      <span className={`relative ${active ? "nav-pop" : ""}`}>
        <NavIcon name={name} active={active} className="size-6" />
      </span>
    </span>
  );
}

function Tab({ href, label, icon, active }: Omit<NavLink, "more" | "match"> & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${tabClass} ${active ? "text-[var(--ex-gold)]" : "text-slate-500 active:text-slate-300"}`}
    >
      <TabIcon name={icon} active={active} />
      <span className="max-w-full truncate px-1">{label}</span>
    </Link>
  );
}
