"use client";

import { useEffect, useState } from "react";

type Stop = { id: string; label: string; detail?: string };

/**
 * A list of a lesson's sections that highlights the one being read and jumps
 * to a section when tapped. Meant for the sticky sidebar.
 */
export function SectionTracker({ title, stops }: { title: string; stops: Stop[] }) {
  const [active, setActive] = useState(stops[0]?.id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The last section whose top has scrolled past the header is the one being read.
      const passed = stops.filter((s) => {
        const el = document.getElementById(s.id);
        return el && el.getBoundingClientRect().top <= 160;
      });
      setActive((passed.at(-1) ?? stops[0])?.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [stops]);

  const activeIndex = stops.findIndex((s) => s.id === active);

  return (
    <nav className="rounded-2xl border border-white/[0.07] bg-night-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-5">
      <h2 className="mb-3 text-base font-semibold text-slate-100">{title}</h2>
      <ol className="relative space-y-0.5">
        <span className="absolute top-3 bottom-3 left-[13px] w-px bg-white/10" aria-hidden />
        {stops.map((s, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          return (
            <li key={s.id} className="relative">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-start gap-3 rounded-lg py-1.5 pr-2 transition ${
                  isActive ? "text-amber-100" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <span
                  className={`relative z-10 mt-0.5 grid size-[27px] shrink-0 place-items-center rounded-full text-[11px] font-bold ring-4 ring-night-900 transition ${
                    isActive
                      ? "bg-amber-400 text-night-950 shadow-[0_0_14px] shadow-amber-400/60"
                      : isPast
                        ? "bg-amber-400/25 text-amber-100"
                        : "bg-night-700 text-slate-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 pt-1 text-sm leading-tight">
                  <span className={`block ${isActive ? "font-semibold" : "font-medium"}`}>{s.label}</span>
                  {s.detail && <span className="mt-0.5 block text-xs text-slate-500">{s.detail}</span>}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * One short entry per day of the week, saved in this browser only (nothing is
 * sent to the server or seen by teachers).
 */
export function DailyJournal({ storageKey, prompt }: { storageKey: string; prompt: string }) {
  const [entries, setEntries] = useState<string[]>(() => DAYS.map(() => ""));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      if (Array.isArray(saved)) setEntries(DAYS.map((_, i) => String(saved[i] ?? "")));
    } catch {
      // Storage can be blocked (private mode); the journal still works for this visit.
    }
  }, [storageKey]);

  const update = (index: number, value: string) => {
    const next = entries.map((e, i) => (i === index ? value : e));
    setEntries(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const done = entries.filter((e) => e.trim()).length;

  return (
    <div className="not-prose my-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">{prompt}</p>
        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
          <span className="flex gap-1" aria-hidden>
            {DAYS.map((d, i) => (
              <span
                key={d}
                className={`size-2 rounded-full transition ${entries[i].trim() ? "bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400/70" : "bg-white/10"}`}
              />
            ))}
          </span>
          {done} of 7
        </span>
      </div>
      <ol className="space-y-2">
        {DAYS.map((day, i) => {
          const filled = entries[i].trim() !== "";
          return (
            <li key={day} className="flex items-center gap-3">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                  filled ? "bg-emerald-400 text-night-950" : "bg-white/5 text-slate-500 ring-1 ring-white/10"
                }`}
                aria-hidden
              >
                {filled ? "✓" : day[0]}
              </span>
              <input
                value={entries[i]}
                onChange={(e) => update(i, e.target.value)}
                aria-label={`${day}: ${prompt}`}
                placeholder={`${day}…`}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-night-800/80 px-3 py-2 text-base text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none sm:text-sm"
              />
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-slate-500">Saved on this device only. Your teachers can&apos;t see it.</p>
    </div>
  );
}
