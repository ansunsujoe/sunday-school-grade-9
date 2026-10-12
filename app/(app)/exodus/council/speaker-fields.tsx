"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";
import { CLANS, clanInfo } from "@/lib/exodus/clans";
import { NOTABLES, SCRIBE, type Persona } from "@/lib/exodus/council";
import type { RoleHolder } from "@/lib/exodus/queries";
import { ClanPicker } from "../clan-picker";
import { PersonaSeal } from "./persona-seal";

/** Past this many people, the clan's list gets a search box. */
const SEARCH_FROM = 12;

/**
 * Which clans a council message goes to, and who brings it. The leaders of
 * Israel (and the Scribe, with `withScribe`) can speak to any number of clans;
 * someone from a clan (anyone with a role other than Villager) only to their
 * own, so they're offered once one clan is picked. Posts "clans" checkboxes
 * and a "speaker" radio, read on the server by readSpeaker.
 */
export function ClansAndSpeaker({
  holders,
  legend,
  initialClans = [],
  withScribe = false,
}: {
  holders: RoleHolder[];
  legend: string;
  initialClans?: string[];
  /** Offer the Scribe first, picked to start with. */
  withScribe?: boolean;
}) {
  const fallback = withScribe ? "scribe:" : "";
  const [clans, setClans] = useState<string[]>(initialClans);
  const [speaker, setSpeaker] = useState(fallback);
  const [query, setQuery] = useState("");

  const single = clans.length === 1 ? clans[0] : null;
  const people = single ? holders.filter((h) => h.clanSlug === single) : [];
  const q = query.trim().toLowerCase();
  const shownPeople = q
    ? people.filter((p) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q))
    : people;

  function pickClans(next: string[]) {
    setClans(next);
    setQuery("");
    // Someone from a clan can't follow the matter to another clan, or to several.
    if (speaker.startsWith("member:")) {
      const id = Number(speaker.slice("member:".length));
      const still = next.length === 1 && holders.some((h) => h.id === id && h.clanSlug === next[0]);
      if (!still) setSpeaker(fallback);
    }
  }

  return (
    <div className="space-y-6">
      <ClanPicker clans={CLANS} initial={initialClans} onChange={pickClans} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">{legend}</legend>

        {withScribe && (
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <SpeakerOption value="scribe:" persona={SCRIBE} checked={speaker === "scribe:"} onPick={setSpeaker} />
          </div>
        )}

        <p className="mb-2 font-display text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Leaders of Israel
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {NOTABLES.map((p) => (
            <SpeakerOption
              key={p.name}
              value={`notable:${p.name}`}
              persona={p}
              checked={speaker === `notable:${p.name}`}
              onPick={setSpeaker}
            />
          ))}
        </div>

        <p className="mt-5 mb-2 font-display text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
          {single ? `From the ${clanInfo(single).name}` : "From a clan"}
        </p>
        {!single ? (
          <p className="text-sm text-slate-500">
            Pick just one clan to have one of its people speak: anyone with a role other than Villager.
          </p>
        ) : people.length === 0 ? (
          <p className="text-sm text-slate-500">
            No one in the {clanInfo(single).name} has a role yet. Give people roles on the clan&apos;s page.
          </p>
        ) : (
          <>
            {people.length > SEARCH_FROM && (
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${people.length} people by name or role…`}
                aria-label="Search the clan's people"
                className={`${inputClass} mb-2`}
              />
            )}
            <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
              {shownPeople.map((h) => (
                <SpeakerOption
                  key={h.id}
                  value={`member:${h.id}`}
                  persona={{ name: h.name, title: h.role }}
                  checked={speaker === `member:${h.id}`}
                  onPick={setSpeaker}
                />
              ))}
            </div>
          </>
        )}
      </fieldset>
    </div>
  );
}

/** One person to pick, as a radio card with their seal. */
function SpeakerOption({
  value,
  persona,
  checked,
  onPick,
}: {
  value: string;
  persona: Persona;
  checked: boolean;
  onPick: (value: string) => void;
}) {
  return (
    <label
      className={`flex min-h-14 cursor-pointer items-center gap-3 border px-3 py-2 transition ${
        checked ? "border-[var(--ex-gold-soft)] bg-amber-400/[0.06]" : "border-line-subtle hover:border-line-strong"
      }`}
    >
      <input
        type="radio"
        name="speaker"
        value={value}
        checked={checked}
        onChange={() => onPick(value)}
        className="sr-only"
        required
      />
      <PersonaSeal name={persona.name} size="sm" />
      <span className="min-w-0">
        <span className="block truncate font-display font-semibold text-slate-100">{persona.name}</span>
        <span className="block truncate text-xs text-slate-500">{persona.title}</span>
      </span>
    </label>
  );
}
