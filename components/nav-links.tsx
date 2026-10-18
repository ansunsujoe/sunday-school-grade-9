"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavIcon, type NavIconName } from "./nav-icons";

/**
 * `match` lists other path prefixes that belong to the same tab. On phones,
 * links marked `more` aren't tabs; every link with a `group` is listed in the
 * menu sheet under that heading, with its `hint` beneath the label.
 */
type NavLink = {
  href: string;
  label: string;
  icon: NavIconName;
  more?: boolean;
  match?: readonly string[];
  group?: string;
  hint?: string;
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

/**
 * Inline nav for tablets and up. Home is left out: the logo beside it goes
 * home. (On phones Home stays a tab, within thumb's reach.)
 */
export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-1 md:flex">
      {links.filter((l) => l.href !== "/").map(({ href, label, match }) => (
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
 * gold pill. The last tab opens the menu: a sheet with every page, grouped.
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
      {extra.length > 0 && (
        <MenuSheet links={links} open={open} onClose={() => setOpen(false)} pathname={pathname} />
      )}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ex-rule)] bg-night-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
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
              aria-controls="menu-sheet"
              className={`${tabClass} ${open || extraActive ? "text-[var(--ex-gold)]" : "text-slate-500"}`}
            >
              <TabIcon name={open ? "close" : "menu"} active={open || extraActive} />
              Menu
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

/**
 * Every page, grouped, in a sheet that rises from behind the tab bar. It
 * stays mounted so it can slide away again; drag it down, tap outside, or
 * press Escape to close it.
 */
function MenuSheet({
  links,
  open,
  onClose,
  pathname,
}: {
  links: readonly NavLink[];
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const [drag, setDrag] = useState<{ start: number; dy: number } | null>(null);
  const sheet = useRef<HTMLDivElement>(null);

  const groups: { name: string; links: NavLink[] }[] = [];
  for (const link of links) {
    if (!link.group) continue;
    const group = groups.find((g) => g.name === link.group);
    if (group) group.links.push(link);
    else groups.push({ name: link.group, links: [link] });
  }

  // While open: the page behind stays put, Escape closes, focus moves in.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add("nav-open");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    sheet.current?.focus({ preventScroll: true });
    return () => {
      html.classList.remove("nav-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function endDrag() {
    if (drag && drag.dy > 70) onClose();
    setDrag(null);
  }

  const offset = drag ? Math.max(0, drag.dy) : 0;
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={sheet}
        id="menu-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        inert={!open}
        className={`fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-[var(--ex-rule)] bg-night-900 shadow-[0_-20px_50px_-12px] shadow-black/60 outline-none ${
          drag ? "" : "transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1)]"
        }`}
        style={{ transform: open ? `translateY(${offset}px)` : "translateY(calc(100% + 5rem))" }}
      >
        {/* The handle: drag down to close. */}
        <div
          className="flex touch-none justify-center pt-2.5 pb-1"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag({ start: e.clientY, dy: 0 });
          }}
          onPointerMove={(e) => drag && setDrag({ ...drag, dy: e.clientY - drag.start })}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="h-1 w-10 rounded-full bg-line-strong" />
        </div>

        <div className="px-4 pb-3">
          {groups.map((group, gi) => (
            <section key={group.name} className={gi ? "mt-3" : "mt-0.5"}>
              <h2 className="mb-1.5 px-2 text-[11px] font-semibold tracking-[0.18em] text-[var(--ex-gold)] uppercase">
                {group.name}
              </h2>
              <ul className="overflow-hidden rounded-2xl bg-wash">
                {group.links.map(({ href, label, icon, hint, match }, i) => {
                  const active = isActive(pathname, { href, match });
                  return (
                    <li key={href} className="border-line-faint not-first:border-t">
                      <Link
                        href={href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 px-3 py-2 transition active:bg-wash-hover ${
                          open ? "nav-rise" : ""
                        }`}
                        style={{ animationDelay: `${60 + (gi * 3 + i) * 25}ms` }}
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                            active ? "bg-amber-400/15 text-[var(--ex-gold)]" : "bg-night-800 text-slate-300"
                          }`}
                        >
                          <NavIcon name={icon} active={active} className="size-[22px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[15px] leading-tight font-medium ${
                              active ? "text-[var(--ex-gold)]" : "text-slate-100"
                            }`}
                          >
                            {label}
                          </span>
                          {hint && <span className="mt-0.5 block truncate text-xs text-slate-500">{hint}</span>}
                        </span>
                        {active ? (
                          <span className="size-1.5 rotate-45 bg-[var(--ex-gold)]" aria-hidden />
                        ) : (
                          <svg viewBox="0 0 24 24" className="size-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
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
