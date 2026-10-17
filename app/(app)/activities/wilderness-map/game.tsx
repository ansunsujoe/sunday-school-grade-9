"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import type { LeaderRow } from "@/lib/activities/leaderboard";
import {
  GRACE_MS,
  MAX_POINTS,
  PLACES,
  ROUNDS,
  scoreGuess,
  timeFactor,
  unproject,
  type Clue,
  type Place,
} from "@/lib/activities/places";
import { saveMapScore, type MapGuess, type SavedMapScore } from "@/lib/actions/activities";
import { Divider, Dunes, ExHeading, GlyphSeal, Mark, Panel, type GlyphName } from "../../exodus/ornaments";
import { useCountUp, useElapsed } from "./motion";
import { SinaiMap } from "./sinai-map";
import { formatSeconds, Standings } from "./standings";

type Round = { place: Place; clue: Clue };
type Result = ReturnType<typeof scoreGuess> & { ms: number };
type Point = { x: number; y: number };

function shuffle<T>(items: T[]) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ten places, each with one of its clues picked at random. */
function newGame(): Round[] {
  return shuffle(PLACES)
    .slice(0, ROUNDS)
    .map((place) => ({ place, clue: place.clues[Math.floor(Math.random() * place.clues.length)] }));
}

export function WildernessMapGame({
  leaders,
  personalBest,
  userId,
}: {
  leaders: LeaderRow[];
  personalBest: number | null;
  userId: number;
}) {
  // Rounds are dealt on Start, in the browser, so the server never has to guess the shuffle.
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<Point | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [guesses, setGuesses] = useState<MapGuess[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedMapScore | "saving" | null>(null);

  const round = rounds?.[index];
  const revealed = results.length > index;
  const finished = rounds !== null && index >= rounds.length;
  const total = results.reduce((sum, r) => sum + r.points, 0);
  const elapsed = useElapsed(startedAt, Boolean(round) && !revealed);

  function start() {
    setRounds(newGame());
    setIndex(0);
    setGuess(null);
    setResults([]);
    setGuesses([]);
    setSaved(null);
    setStartedAt(performance.now());
  }

  function submit() {
    if (!round || !guess || revealed || startedAt === null) return;
    const ms = performance.now() - startedAt;
    const { lat, lon } = unproject(guess.x, guess.y);
    setResults([...results, { ...scoreGuess({ lat, lon }, round.place, ms), ms }]);
    setGuesses([...guesses, { slug: round.place.slug, lat, lon, ms }]);
  }

  async function next() {
    setGuess(null);
    setIndex(index + 1);
    setStartedAt(performance.now());
    if (rounds && index + 1 === rounds.length) {
      setSaved("saving");
      setSaved(await saveMapScore(guesses).catch(() => ({ ok: false as const, error: "Couldn't save your score." })));
    }
  }

  if (!rounds) return <Intro onStart={start} leaders={leaders} personalBest={personalBest} userId={userId} />;
  if (finished) return <Summary rounds={rounds} results={results} total={total} saved={saved} onAgain={start} />;
  if (!round) return null;

  const result = revealed ? results[index] : null;
  const last = index + 1 === rounds.length;

  function quit() {
    if (results.length === 0 || window.confirm("Leave this game? Your score so far won't be saved.")) setRounds(null);
  }

  // Below large screens the game takes the whole screen, so nothing is ever
  // below the fold: a slim bar with the score, the clue, then the map filling
  // what's left, and the result rising from the bottom on reveal. Large
  // screens: the map on the left, the clue and its controls down the right.
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night-950 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:static lg:z-auto lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-5 lg:bg-transparent lg:p-0">
      <div className="ex-backdrop lg:hidden" aria-hidden />
      <HtmlClass name="wm-playing" />

      {/* Phones and tablets: leave, progress, and the score, big. */}
      <div className="flex shrink-0 items-center gap-3 px-3 pt-2 pb-1.5 lg:hidden">
        <button
          type="button"
          onClick={quit}
          aria-label="Leave the game"
          className="grid size-9 shrink-0 place-items-center text-slate-400 transition active:scale-90 active:text-slate-100"
        >
          <Icon name="close" className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--ex-gold)] uppercase">
            Clue {index + 1} of {rounds.length}
          </p>
          <Progress results={results} count={rounds.length} index={index} className="mt-1" />
        </div>
        <ScoreTally value={total} gain={result?.points} round={index} />
      </div>

      <section className="ex-panel mx-3 shrink-0 lg:col-start-2 lg:row-start-1 lg:mx-0">
        <div className="p-2.5 lg:p-5">
          <div className="hidden items-start gap-3 lg:flex">
            <button
              type="button"
              onClick={quit}
              aria-label="Leave the game"
              title="Leave the game"
              className="-mt-1 -ml-1 grid size-8 shrink-0 place-items-center text-slate-500 transition hover:text-slate-100"
            >
              <Icon name="close" className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="ex-heading">
                Clue {index + 1} of {rounds.length}
              </h2>
              <Progress results={results} count={rounds.length} index={index} className="mt-3" />
            </div>
            <ScoreTally value={total} gain={result?.points} round={index} />
          </div>
          <div key={index} className="ex-scroll wm-unroll mx-2 my-2 px-3 py-2 text-center lg:mt-6 lg:mb-2 lg:px-4 lg:py-4">
            <ClueText text={round.clue.text} />
          </div>
        </div>
      </section>

      <MapFrame
        fill
        className="lg:col-start-1 lg:row-span-2 lg:row-start-1"
        overlay={
          result ? null : (
            <MapControls ms={elapsed} ready={Boolean(guess)} onGuess={submit} />
          )
        }
      >
        <SinaiMap
          guess={guess}
          answer={result ? round.place : null}
          points={result?.points}
          onPick={revealed ? undefined : setGuess}
          fluid
        />
      </MapFrame>

      <section
        className={`ex-panel shrink-0 lg:col-start-2 lg:row-start-2 ${
          result ? "wm-sheet mx-3 mb-2 lg:mx-0 lg:mb-0" : "hidden lg:block"
        }`}
      >
        <div className="p-3.5 lg:p-5">
          {result ? (
            <Reveal key={`r${index}`} round={round} result={result} last={last} onNext={next} />
          ) : (
            <>
              <Timer ms={elapsed} />
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  {guess ? "Happy with your pin?" : "Click the map where this happened."}
                </p>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!guess}
                  className={`${buttonClass} ${guess ? "wm-ready" : ""}`}
                >
                  Guess
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <EnterKey onEnter={result ? next : guess ? submit : undefined} />
    </div>
  );
}

/**
 * Puts a class on <html> while mounted, for page-wide rules in globals.css:
 * "wm-playing" mid-game (below large screens the page behind the full-screen
 * game stops scrolling; on large screens the game's header steps aside) and
 * "wm-wide" on the start screen (the page drops its width cap for the map).
 */
function HtmlClass({ name }: { name: string }) {
  useEffect(() => {
    document.documentElement.classList.add(name);
    return () => document.documentElement.classList.remove(name);
  }, [name]);
  return null;
}

/**
 * The running score, big and gold. On a reveal it counts up as the round's
 * points land on the map, and a "+points" flies up off it.
 */
function ScoreTally({ value, gain, round }: { value: number; gain?: number; round: number }) {
  const shown = useCountUp(value, 900, 1500);
  return (
    <div className="relative shrink-0 text-right">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">Score</p>
      <p className="font-display text-2xl leading-none font-semibold text-[var(--ex-gold)] tabular-nums lg:text-3xl">
        {shown.toLocaleString()}
      </p>
      {gain !== undefined && gain > 0 && (
        <span
          key={round}
          aria-hidden
          className="wm-gain pointer-events-none absolute top-full right-0 font-display text-sm font-semibold whitespace-nowrap text-emerald-300 tabular-nums"
        >
          +{gain.toLocaleString()}
        </span>
      )}
    </div>
  );
}

/** Enter guesses, and then moves on, without reaching for the button. */
function EnterKey({ onEnter }: { onEnter?: () => void }) {
  const latest = useRef(onEnter);
  useEffect(() => {
    latest.current = onEnter;
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (e.key !== "Enter" || target.closest("button, a, input, textarea, [role=button]")) return;
      latest.current?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

/**
 * What floats over the map below large screens while guessing: the lamp
 * burning down along the top, and Guess at the bottom.
 */
function MapControls({ ms, ready, onGuess }: { ms: number; ready: boolean; onGuess: () => void }) {
  const factor = timeFactor(ms);
  const grace = ms < GRACE_MS;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between lg:hidden">
      <div>
        <div className="h-1 bg-black/20">
          <div
            className={`h-full origin-left transition-transform duration-100 ease-linear ${
              grace ? "wm-shimmer bg-[var(--ex-gold)]" : factor > 0.7 ? "bg-[var(--ex-gold)]" : "bg-rose-400"
            }`}
            style={{ transform: `scaleX(${grace ? 1 : (factor - 0.5) / 0.5})` }}
          />
        </div>
        <span className="m-2 inline-flex items-center gap-2 bg-night-950/80 px-2.5 py-1 text-xs text-slate-300 backdrop-blur">
          <span className="tabular-nums">{formatSeconds(ms)}</span>
          <span className="text-slate-500">·</span>
          <span>
            up to{" "}
            <span className="font-semibold text-slate-50 tabular-nums">
              {Math.round(MAX_POINTS * factor).toLocaleString()}
            </span>
          </span>
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 p-2.5">
        <span className="bg-night-950/80 px-2.5 py-1 text-xs text-slate-400 backdrop-blur">
          {ready ? "Happy with your pin?" : "Tap where this happened"}
        </span>
        <button
          type="button"
          onClick={onGuess}
          disabled={!ready}
          className={`${buttonClass} pointer-events-auto shadow-xl ${
            ready ? "wm-ready" : "disabled:bg-none disabled:bg-night-700 disabled:text-slate-400 disabled:opacity-100"
          }`}
        >
          Guess
        </button>
      </div>
    </div>
  );
}

/** The clue, one word at a time. */
function ClueText({ text }: { text: string }) {
  return (
    <p className="font-display text-lg leading-snug font-semibold text-balance text-slate-50 sm:text-xl lg:text-2xl">
      {text.split(" ").map((word, i) => (
        <span key={i} className="wm-word" style={{ animationDelay: `${250 + i * 45}ms` }}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

/**
 * The oil running out: a gold bar that holds full through the grace time,
 * then drains as each second takes a little off.
 */
function Timer({ ms }: { ms: number }) {
  const factor = timeFactor(ms);
  const grace = ms < GRACE_MS;
  const fill = grace ? 1 : (factor - 0.5) / 0.5;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="flex items-center gap-1.5 tracking-[0.14em] text-slate-500 uppercase">
          <span className={`size-1.5 rotate-45 bg-[var(--ex-gold)] ${grace ? "" : "motion-safe:animate-pulse"}`} />
          {formatSeconds(ms)}
        </span>
        <span className="text-slate-400">
          Worth up to{" "}
          <span className="font-semibold text-slate-100 tabular-nums">
            {Math.round(MAX_POINTS * factor).toLocaleString()}
          </span>
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden bg-wash">
        <div
          className={`h-full origin-left transition-transform duration-100 ease-linear ${
            grace ? "wm-shimmer bg-[var(--ex-gold)]" : fill > 0.4 ? "bg-[var(--ex-gold)]" : "bg-rose-400"
          }`}
          style={{ transform: `scaleX(${fill})` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        {grace ? `${Math.ceil((GRACE_MS - ms) / 1000)}s before the clock starts costing points` : "Each second takes 1% off"}
      </p>
    </div>
  );
}

function Reveal({
  round,
  result,
  last,
  onNext,
}: {
  round: Round;
  result: Result;
  last: boolean;
  onNext: () => void;
}) {
  const points = useCountUp(result.points, 900, 1500);
  return (
    <div className="wm-rise">
      <div className="flex flex-wrap items-center gap-2">
        <span className="wm-stamp" style={{ animationDelay: "1.5s" }}>
          <Mark tone={result.found ? "green" : "gold"}>
            {result.found ? "Found it" : `${Math.round(result.km).toLocaleString()} km off`}
          </Mark>
        </span>
        <span className="text-xs text-slate-500">{round.clue.ref}</span>
      </div>
      <p className="mt-1.5 font-display text-xl font-semibold text-slate-50 lg:mt-2 lg:text-2xl">{round.place.name}</p>
      {/* Phones: the working on one line, to keep the sheet short. */}
      <p className="mt-0.5 text-xs text-slate-500 tabular-nums lg:hidden">
        {result.base.toLocaleString()} × {Math.round(result.factor * 100)}% for {formatSeconds(result.ms)}
      </p>

      <dl className="mt-3 hidden space-y-1 border-y border-[var(--ex-rule)] py-2 text-sm lg:block">
        <div className="flex justify-between">
          <dt className="text-slate-400">{result.found ? "Right place" : "Distance"}</dt>
          <dd className="text-slate-200 tabular-nums">{result.base.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Time ({formatSeconds(result.ms)})</dt>
          <dd className="text-slate-200 tabular-nums">× {Math.round(result.factor * 100)}%</dd>
        </div>
      </dl>
      <div className="mt-2 flex items-center justify-between gap-3 lg:mt-3">
        <span className="font-display text-3xl font-semibold text-[var(--ex-gold)] tabular-nums">
          +{points.toLocaleString()}
        </span>
        <button type="button" onClick={onNext} className={buttonClass}>
          {last ? "See score" : "Next clue"}
          <Icon name="chevronRight" className="size-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * The map at a readable size, in a ruled frame. On phones the map is bigger
 * than the screen and sits in a window you can drag around in, starting at
 * the middle; the map itself glides it to each reveal. `fill` is for the
 * full-screen game: the window takes all the height it's given until large
 * screens, where the whole map shows.
 */
function MapFrame({
  children,
  overlay,
  fill = false,
  wide = false,
  className = "",
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  fill?: boolean;
  /** Large screens, outside a game: fill the width and the height under the game's header. */
  wide?: boolean;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo((el.scrollWidth - el.clientWidth) / 2, (el.scrollHeight - el.clientHeight) / 2);
  }, []);
  const frame = fill
    ? // Large screens: the whole height the window has, and all the width beside the panel.
      "mx-3 my-2 flex min-h-0 flex-1 flex-col lg:mx-0 lg:my-0 lg:h-[calc(100dvh-8.5rem)] lg:min-h-[28rem] lg:flex-none"
    : `md:w-full md:max-w-[calc(78vh+0.75rem)] md:justify-self-center ${
        // The game's header (about 11rem) sits above, so the map takes what's left.
        wide ? "lg:h-[calc(100dvh-19.5rem)] lg:min-h-[26rem] lg:max-w-none" : ""
      }`;
  const view = fill
    ? "h-full overflow-auto overscroll-contain lg:overflow-hidden"
    : `h-[56dvh] max-h-[34rem] min-h-72 overflow-auto overscroll-contain md:h-auto md:max-h-none md:overflow-visible ${
        wide ? "lg:h-full lg:overflow-hidden" : ""
      }`;
  const fluid = fill || wide;
  return (
    <div className={`ex-panel min-w-0 p-1 sm:p-1.5 ${fluid ? "lg:p-1" : ""} ${frame} ${className}`}>
      <div className={`relative ${fill ? "min-h-0 flex-1" : ""} ${fluid ? "lg:h-full" : ""}`}>
        <div ref={scroller} data-map-window className={view}>
          <div className={`${fill ? "w-[max(46rem,100%)]" : "w-[46rem] md:w-full"} ${fluid ? "lg:h-full lg:w-full" : ""}`}>
            {children}
          </div>
        </div>
        {overlay}
      </div>
    </div>
  );
}

/** One diamond per clue: green when found, gold for partial points, rose for a long way off. */
function Progress({
  results,
  count,
  index,
  className = "",
}: {
  results: Result[];
  count: number;
  index: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label={`Clue ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => {
        const r = results[i];
        const tone = r
          ? r.found
            ? "bg-emerald-400 border-emerald-400"
            : r.base > MAX_POINTS / 5
              ? "bg-[var(--ex-gold)] border-[var(--ex-gold)]"
              : "bg-rose-400/80 border-rose-400/80"
          : i === index
            ? "border-[var(--ex-gold)] wm-current"
            : "border-line-strong";
        return <span key={i} className={`size-2.5 rotate-45 border transition-colors duration-500 ${tone}`} />;
      })}
    </div>
  );
}

const STEPS: { glyph: GlyphName; title: string; text: string }[] = [
  { glyph: "scroll", title: "Read the clue", text: "Something that happened there, a verse, or what the name means." },
  { glyph: "tents", title: "Drop your pin", text: "Tap the map where you think it was, then press Guess." },
  {
    glyph: "morale",
    title: "Mind the lamp",
    text: `The right place scores ${MAX_POINTS.toLocaleString()}. After ${GRACE_MS / 1000} seconds, each second takes 1% off.`,
  },
];

function Intro({
  onStart,
  leaders,
  personalBest,
  userId,
}: {
  onStart: () => void;
  leaders: LeaderRow[];
  personalBest: number | null;
  userId: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-5">
      <div className="space-y-6 lg:order-2">
        <Panel title="How to play" className="wm-rise">
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="wm-rise flex gap-3" style={{ animationDelay: `${120 + i * 90}ms` }}>
                <GlyphSeal name={s.glyph} />
                <span>
                  <span className="block font-display font-semibold text-slate-100">{s.title}</span>
                  <span className="block text-sm leading-6 text-slate-400">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <Divider className="my-5" />
          <p className="text-center text-sm text-slate-500">
            {ROUNDS} clues from {PLACES.length} places
            {personalBest !== null && (
              <>
                {" · "}your best <span className="font-semibold text-slate-200">{personalBest.toLocaleString()}</span>
              </>
            )}
          </p>
          <button type="button" onClick={onStart} className={`${buttonClass} wm-ready mt-4 w-full`}>
            Set out
          </button>
        </Panel>

        <Panel
          title="Top travellers"
          action={
            <Link href="/activities/wilderness-map/leaderboard" className="text-[var(--ex-gold)] hover:underline">
              All
            </Link>
          }
          className="wm-rise [animation-delay:200ms]"
        >
          <Standings rows={leaders} userId={userId} compact />
        </Panel>
      </div>
      <MapFrame wide className="lg:order-1">
        <SinaiMap guess={null} answer={null} fluid />
      </MapFrame>
      <HtmlClass name="wm-wide" />
    </div>
  );
}

function Summary({
  rounds,
  results,
  total,
  saved,
  onAgain,
}: {
  rounds: Round[];
  results: Result[];
  total: number;
  saved: SavedMapScore | "saving" | null;
  onAgain: () => void;
}) {
  const shown = useCountUp(total, 1600, 200);
  const found = results.filter((r) => r.found).length;
  const seconds = results.reduce((sum, r) => sum + r.ms, 0);
  const done = saved !== null && saved !== "saving";

  return (
    <div className="mx-auto max-w-2xl">
      <section className="ex-panel wm-rise overflow-hidden text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <Dunes />
        <div className="relative px-5 pt-8 pb-12 sm:pb-16">
          <p className="ex-heading justify-center">The journey&apos;s end</p>
          <p className="mt-3 font-display text-6xl font-semibold text-slate-50 tabular-nums sm:text-7xl">
            {shown.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            out of {(rounds.length * MAX_POINTS).toLocaleString()} · found {found} of {rounds.length} ·{" "}
            {formatSeconds(seconds)}
          </p>
          <div className="mt-5 flex min-h-7 flex-wrap items-center justify-center gap-2">
            {saved === "saving" && <span className="text-sm text-slate-500">Writing it in the record…</span>}
            {done && saved.ok && (
              <>
                {saved.personalBest && (
                  <span className="wm-stamp" style={{ animationDelay: "1.6s" }}>
                    <Mark tone="gold">New personal best</Mark>
                  </span>
                )}
                <span className="wm-stamp" style={{ animationDelay: "1.9s" }}>
                  <Mark tone="green">
                    Rank #{saved.rank} of {saved.players}
                  </Mark>
                </span>
              </>
            )}
            {done && !saved.ok && <span className="text-sm text-rose-300">{saved.error}</span>}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onAgain} className={buttonClass}>
              Play again
            </button>
            <Link href="/activities/wilderness-map/leaderboard" className={secondaryButtonClass}>
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ExHeading>The road you took</ExHeading>
      </div>
      <ul className="divide-y divide-line-faint">
        {rounds.map((r, i) => {
          const res = results[i];
          return (
            <li
              key={r.place.slug}
              className="wm-rise flex items-start gap-4 py-3"
              style={{ animationDelay: `${600 + i * 70}ms` }}
            >
              <span
                className={`mt-1.5 size-2 shrink-0 rotate-45 ${res.found ? "bg-emerald-400" : "bg-[var(--ex-gold)]"}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-slate-300">{r.clue.text}</span>
                <span className="block text-sm font-semibold text-slate-100">
                  {r.place.name}
                  <span className="font-normal text-slate-500"> · {r.clue.ref}</span>
                </span>
              </span>
              <span className="shrink-0 text-right text-sm tabular-nums">
                <span className="block font-semibold text-slate-100">{res.points.toLocaleString()}</span>
                <span className="block text-xs text-slate-500">
                  {res.found ? "" : `${Math.round(res.km)} km · `}
                  {formatSeconds(res.ms)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
