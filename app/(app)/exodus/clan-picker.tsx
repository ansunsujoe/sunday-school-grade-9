"use client";

import Image from "next/image";
import { useState } from "react";
import type { ClanInfo } from "@/lib/exodus/clans";

/**
 * Checkboxes named "clans", one per clan, with a shortcut to pick them all.
 * Starts with every clan picked unless `initial` says otherwise.
 */
export function ClanPicker({
  clans,
  initial,
  onChange,
}: {
  clans: ClanInfo[];
  initial?: string[];
  /** Told the picked slugs whenever they change. */
  onChange?: (picked: string[]) => void;
}) {
  const [picked, setPickedState] = useState(() => new Set(initial ?? clans.map((c) => c.slug)));
  const all = picked.size === clans.length;

  const setPicked = (next: Set<string>) => {
    setPickedState(next);
    onChange?.([...next]);
  };
  const toggle = (slug: string) => {
    const next = new Set(picked);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setPicked(next);
  };

  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-slate-300">Send to</legend>
        <button
          type="button"
          onClick={() => setPicked(all ? new Set() : new Set(clans.map((c) => c.slug)))}
          className="px-2 py-1 text-xs font-medium text-[var(--ex-gold)] hover:underline"
        >
          {all ? "Clear all" : "All clans"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {clans.map((clan) => {
          const on = picked.has(clan.slug);
          return (
            <label
              key={clan.slug}
              className={`flex min-h-11 cursor-pointer items-center gap-2 border px-2.5 py-2 text-sm transition ${
                on
                  ? "border-[var(--ex-gold-soft)] bg-amber-400/[0.07] text-slate-50"
                  : "border-line-subtle text-slate-400 hover:border-line-strong"
              }`}
            >
              <input
                type="checkbox"
                name="clans"
                value={clan.slug}
                checked={on}
                onChange={() => toggle(clan.slug)}
                className="sr-only"
              />
              <span className="relative size-7 shrink-0 overflow-hidden rounded-full">
                <Image src={clan.logo} alt="" fill sizes="28px" className={`scale-[1.04] object-cover ${on ? "" : "opacity-50 grayscale"}`} />
              </span>
              <span className="truncate font-display font-semibold">{clan.name}</span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        {picked.size === 0 ? "No clans picked." : all ? "Every clan." : `${picked.size} of ${clans.length} clans.`}
      </p>
    </fieldset>
  );
}
