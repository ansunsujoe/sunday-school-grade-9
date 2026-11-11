"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import { studyVerse } from "@/lib/actions/verse-map";
import { CLANS, type ClanSlug } from "@/lib/exodus/clans";
import { MAX_POINTS, TERRITORIES, regionInfo } from "@/lib/verse-map/map";
import type { StandingRow } from "@/lib/verse-map/queries";
import { Icon } from "@/components/icons";
import { ClanLogo } from "../../exodus/game-ui";
import { VersePractice } from "../../memory-verse/practice";
import { Panel } from "../../exodus/ornaments";
import { VerseTry } from "./verse-try";
import { CLAN_FILL, NO_CLAN_FILL, WorldMap, type MapHolder } from "./world-map";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function WorldGame({
  userId,
  isTeacher,
  holders,
  standings,
  bests,
}: {
  userId: number;
  isTeacher: boolean;
  holders: Record<string, MapHolder>;
  standings: StandingRow[];
  bests: Record<string, number>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [trying, setTrying] = useState(false);
  const [study, setStudy] = useState<{ slug: string; text: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const territory = TERRITORIES.find((t) => t.slug === selected) ?? null;
  const holder = territory ? holders[territory.slug] : undefined;
  const mine = Object.values(holders).filter((h) => h.userId === userId);

  function select(slug: string) {
    setSelected(slug);
    setStudy(null);
    setMessage(null);
  }

  function loadStudy() {
    if (!territory) return;
    startTransition(async () => {
      const res = await studyVerse(territory.slug);
      if (res.ok) setStudy({ slug: territory.slug, text: res.text });
      else setMessage(res.error);
    });
  }

  // What a try at the selected territory needs, in plain words.
  const need = !holder
    ? `Score 1 or more to claim it. You get ${MAX_POINTS} points, minus one for each mistake.`
    : holder.userId === userId
      ? `A score above ${holder.soldiers} adds soldiers. A lower one never takes any away.`
      : `Score ${holder.soldiers} or more to take it (${plural(MAX_POINTS - holder.soldiers, "mistake")} at most).`;

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <WorldMap holders={holders} selected={selected} onSelect={select} />
            <p className="mt-3 text-xs text-slate-500">
              Each territory is one verse. Tap a region to zoom in, then a territory to see who holds it.
              {!isTeacher &&
                ` You hold ${mine.length} of ${TERRITORIES.length} with ${plural(
                  mine.reduce((sum, h) => sum + h.soldiers, 0),
                  "soldier",
                )}.`}
            </p>
          </Panel>

          <Panel title="How it works">
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                Answer with the <strong className="text-slate-50">first letter</strong> of each word, or type the{" "}
                <strong className="text-slate-50">whole verse</strong>. Both score the same.
              </li>
              <li>
                Every try starts with <strong className="text-slate-50">{MAX_POINTS} points</strong>. Each mistake (a wrong
                letter, or a wrong, missing, or extra word) costs one. Capitals and punctuation never count.
              </li>
              <li>Whatever’s left is your soldiers. With {MAX_POINTS} or more mistakes you get none.</li>
              <li>
                <strong className="text-slate-50">Unclaimed:</strong> any score of 1 or more claims it with that many
                soldiers.
              </li>
              <li>
                <strong className="text-slate-50">Someone else’s:</strong> match or beat their soldiers to take it, with
                your score as your soldiers. Otherwise it stays theirs.
              </li>
              <li>
                <strong className="text-slate-50">Your own:</strong> a better score adds soldiers; a worse one never costs
                you any.
              </li>
            </ul>
          </Panel>

        </div>

        <div className="space-y-6">
          <Panel title={territory ? regionInfo(territory.region).name : "Territory"}>
            {territory ? (
              <>
                <p className="font-display text-2xl font-semibold text-slate-50">{territory.name}</p>
                <p className="text-sm font-semibold tracking-[0.15em] text-[var(--ex-gold)] uppercase">
                  {territory.reference}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Held by</dt>
                    <dd className="flex items-center gap-2 font-medium text-slate-100">
                      {holder ? (
                        <>
                          <Swatch clan={holder.clan} />
                          {holder.userId === userId ? "You" : holder.name}
                        </>
                      ) : (
                        "No one yet"
                      )}
                    </dd>
                  </div>
                  {holder && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Soldiers</dt>
                      <dd className="font-medium text-slate-100 tabular-nums">
                        {holder.soldiers} of {MAX_POINTS}
                      </dd>
                    </div>
                  )}
                  {bests[territory.slug] !== undefined && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Your best score</dt>
                      <dd className="font-medium text-slate-100 tabular-nums">
                        {bests[territory.slug]} of {MAX_POINTS}
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 text-sm text-slate-400">{need}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setTrying(true)} className={buttonClass}>
                    {holder ? (holder.userId === userId ? "Strengthen" : "Attack") : "Claim it"}
                  </button>
                  <button type="button" onClick={loadStudy} disabled={pending} className={secondaryButtonClass}>
                    Study
                  </button>
                </div>
                {isTeacher && (
                  <p className="mt-3 text-xs text-slate-500">You can try it to test, but teachers never hold territories.</p>
                )}
                {message && <p className="mt-3 text-sm text-rose-300">{message}</p>}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Pick a region on the map, then a territory, to see its verse and who holds it.
              </p>
            )}
          </Panel>

          <Panel title="Standings">
            {standings.length === 0 ? (
              <p className="text-sm text-slate-500">No territories claimed yet.</p>
            ) : (
              <ol className="divide-y divide-line-faint">
                {standings.map((row) => {
                  const clan = row.clan ? CLANS.find((c) => c.slug === row.clan) : undefined;
                  return (
                    <li
                      key={row.userId}
                      className={`flex items-center gap-3 py-2.5 ${row.userId === userId ? "-mx-2 bg-amber-400/8 px-2" : ""}`}
                    >
                      <span className="w-6 shrink-0 text-center font-display text-lg font-semibold text-slate-500 tabular-nums">
                        {row.rank}
                      </span>
                      {clan ? <ClanLogo clan={clan} className="size-8 ring-1" /> : <Swatch clan={null} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-100">{row.name}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {plural(row.soldiers, "soldier")}
                          {row.regions.length > 0 && (
                            <span className="text-[var(--ex-gold)]">
                              {" "}
                              · all of {row.regions.map((r) => regionInfo(r).name).join(", ")}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-display text-lg leading-tight font-semibold text-slate-50 tabular-nums">
                          {row.territories}
                        </span>
                        <span className="block text-[10px] tracking-wider text-slate-500 uppercase">
                          {row.territories === 1 ? "territory" : "territories"}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      {study && territory?.slug === study.slug && (
        <StudySheet
          name={territory.name}
          reference={territory.reference}
          text={study.text}
          onClose={() => setStudy(null)}
          onTry={() => {
            setStudy(null);
            setTrying(true);
          }}
        />
      )}

      {trying && territory && (
        <VerseTry
          territory={territory}
          holder={holder ? { name: holder.name, soldiers: holder.soldiers, isMe: holder.userId === userId } : null}
          onClose={(changed) => {
            setTrying(false);
            setStudy(null);
            if (changed) router.refresh();
          }}
        />
      )}
    </>
  );
}

/**
 * Study a territory's verse with the same practice as the memory verse page:
 * read it, then type first letters or whole words with each word checked as
 * you go. Over the whole screen, with a way straight into a try.
 */
function StudySheet({
  name,
  reference,
  text,
  onClose,
  onTry,
}: {
  name: string;
  reference: string;
  text: string;
  onClose: () => void;
  onTry: () => void;
}) {
  // Keep the page behind from scrolling while studying.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950/95 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-10 backdrop-blur-md sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
              Study · {name}
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-slate-50 sm:text-4xl">{reference}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-wash hover:text-slate-100"
            aria-label="Back to the map"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <div className="ex-bells mt-4 mb-6" aria-hidden />
        <VersePractice text={text} reference={reference} />
        <div className="mt-8 flex flex-wrap gap-2">
          <button type="button" onClick={onTry} className={buttonClass}>
            I’m ready: try {name}
          </button>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Back to the map
          </button>
        </div>
      </div>
    </div>
  );
}

/** A small hex in a player's color. */
function Swatch({ clan }: { clan: ClanSlug | null }) {
  return (
    <svg viewBox="-10 -10 20 20" className="size-4 shrink-0" aria-hidden>
      <polygon points="0,-9 7.8,-4.5 7.8,4.5 0,9 -7.8,4.5 -7.8,-4.5" fill={clan ? CLAN_FILL[clan] : NO_CLAN_FILL} />
    </svg>
  );
}
