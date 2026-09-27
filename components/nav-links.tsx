"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "./icons";

type NavLink = { href: string; label: string; icon: IconName; more?: boolean };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Inline nav for tablets and up. */
export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-1 md:flex">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            isActive(pathname, href)
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

/** App-style tab bar pinned to the bottom of the screen on phones. Links marked `more` open from a sheet. */
export function TabBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const primary = links.filter((l) => !l.more);
  const extra = links.filter((l) => l.more);
  const extraActive = extra.some((l) => isActive(pathname, l.href));

  // Close the sheet whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/50"
          />
          <div
            id="more-sheet"
            className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 border-t border-line bg-night-900 px-2 py-2"
          >
            {extra.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] ${
                  isActive(pathname, href) ? "text-amber-300" : "text-slate-200 active:bg-wash"
                }`}
              >
                <Icon name={icon} className="size-5 text-slate-500" />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex h-15 max-w-md">
          {primary.map(({ href, label, icon }) => (
            <Tab key={href} href={href} label={label} icon={icon} active={!open && isActive(pathname, href)} />
          ))}
          {extra.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="more-sheet"
              className={`${tabClass} ${open || extraActive ? "text-amber-300" : "text-slate-500"}`}
            >
              <Icon name={open ? "close" : "menu"} className="size-[22px]" />
              More
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

const tabClass = "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition";

function Tab({ href, label, icon, active }: NavLink & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`${tabClass} ${active ? "text-amber-300" : "text-slate-500 active:text-slate-300"}`}
    >
      <Icon name={icon} className="size-[22px]" />
      <span className="max-w-full truncate px-1">{label}</span>
    </Link>
  );
}
