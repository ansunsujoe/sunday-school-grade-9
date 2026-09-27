"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

type NavLink = { href: string; label: string; icon: IconName };

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

/** App-style tab bar pinned to the bottom of the screen on phones. */
export function TabBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-night-950/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md">
        {links.map(({ href, label, icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition ${
                active ? "text-amber-300" : "text-slate-500 active:text-slate-300"
              }`}
            >
              <Icon name={icon} className={`size-6 ${active ? "drop-shadow-[0_0_8px_rgb(251_191_36/0.5)]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
