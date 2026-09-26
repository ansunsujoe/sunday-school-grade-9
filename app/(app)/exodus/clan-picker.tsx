"use client";

import Image from "next/image";
import { useState } from "react";
import type { ClanInfo } from "@/lib/exodus/clans";

/**
 * Checkboxes named "clans", one per clan, with a shortcut to pick them all.
 * Starts with every clan picked unless `initial` says otherwise.
 */
export function ClanPicker({ clans, initial }: { clans: ClanInfo[]; initial?: string[] }) {
  const [picked, setPicked] = useState(() => new Set(initial ?? clans.map((c) => c.slug)));
  const all = picked.size === clans.length;

  const toggle = (slug: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-slate-300">Send to</legend>
        <button
          type="button"
          onClick={() => setPicked(all ? new Set() : new Set(clans.map((c) => c.slug)))}
          className="rounded-lg px-2 py-1 text-xs font-medium text-amber-300 hover:bg-white/5 hover:text-amber-200"
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
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-sm transition ${
                on
                  ? "border-amber-400/40 bg-amber-400/[0.07] text-slate-50"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5"
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
              <span className="truncate font-medium">{clan.name}</span>
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
