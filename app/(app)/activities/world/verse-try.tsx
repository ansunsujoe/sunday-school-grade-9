"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { buttonClass, secondaryButtonClass } from "@/components/ui";
import {
  finishTry,
  startTry,
  typeLetter,
  voidTry,
  type FinishedTry,
  type StartedTry,
} from "@/lib/actions/verse-map";
import { MAX_POINTS, type Territory, type TryMode } from "@/lib/verse-map/map";
import { Mark } from "../../exodus/ornaments";
import { formatSeconds } from "../wilderness-map/standings";

type Stage =
  | { kind: "ready" }
  | { kind: "starting" }
  | { kind: "typing"; attempt: StartedTry; startedAt: number }
  | { kind: "checking" }
  | { kind: "done"; outcome: FinishedTry; reason?: string }
  | { kind: "error"; message: string };

// More than this many characters arriving at once isn't typing.
const MAX_JUMP = 30;

const MODES: { id: TryMode; label: string; help: string }[] = [
  {
    id: "letters",
    label: "First letters",
    help: "Type just the first letter of each word. Each word appears as you go.",
  },
  {
    id: "words",
    label: "Whole words",
    help: "Type the whole verse out, then press Done.",
  },
];

/**
 * One try at a territory, over the whole screen. The verse is never sent
 * here ahead of time, only its reference: in first-letters mode each word
 * comes back from the server once its letter is in, and in whole-words mode
 * the verse comes back when the try is over. The try is voided if the player
 * leaves the page or window, pastes or drops text, or text arrives faster
 * than anyone types. The server times it on its own clock.
 */
export function VerseTry({
  territory,
  holder,
  onClose,
}: {
  territory: Territory;
  holder: { name: string; soldiers: number; isMe: boolean } | null;
  onClose: (changed: boolean) => void;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "ready" });
  const [mode, setMode] = useState<TryMode>("letters");
  const [pledged, setPledged] = useState(false);
  // On a computer (a mouse or trackpad, and a browser that can do it), a try runs full screen.
  const [fullScreen] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && document.fullscreenEnabled,
  );
  const [answer, setAnswer] = useState("");
  const [now, setNow] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const live = useRef<{ id: number; done: boolean } | null>(null);

  async function begin() {
    if (!pledged) return;
    setStage({ kind: "starting" });
    // Has to be asked for right in the click. If the browser says no, the try goes on without it.
    if (fullScreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    }
    const res = await startTry(territory.slug, mode, pledged);
    if (!res.ok) return setStage({ kind: "error", message: res.error });
    live.current = { id: res.attemptId, done: false };
    setAnswer("");
    setStage({ kind: "typing", attempt: res, startedAt: performance.now() });
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  // In first-letters mode the server already has every letter, so `text` is left empty.
  async function submit(text: string, reason?: string) {
    const current = live.current;
    if (!current || current.done) return;
    current.done = true;
    setStage({ kind: "checking" });
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (reason) await voidTry(current.id, reason);
    const res = await finishTry(current.id, text);
    if (!res.ok) return setStage({ kind: "error", message: res.error });
    setStage({ kind: "done", outcome: res, reason });
  }

  const typing = stage.kind === "typing";

  // Leaving the page or window ends the try on the spot.
  useEffect(() => {
    if (!typing) return;
    const leave = () => submit("", "You left the page");
    const onVisibility = () => document.visibilityState === "hidden" && leave();
    // Only counts if the try started full screen: leaving it (Esc, or a click away) ends the try.
    const startedFull = Boolean(document.fullscreenElement);
    const onFullScreen = () => startedFull && !document.fullscreenElement && submit("", "You left full screen");
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullScreen);
    window.addEventListener("blur", leave);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullScreen);
      window.removeEventListener("blur", leave);
    };
  }, [typing]);

  // Never leave the page stuck full screen, however the try is closed.
  useEffect(
    () => () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    },
    [],
  );

  // The clock on screen, and handing the answer in when time runs out.
  useEffect(() => {
    if (stage.kind !== "typing") return;
    const tick = setInterval(() => {
      const elapsed = performance.now() - stage.startedAt;
      setNow(elapsed);
      if (elapsed > stage.attempt.limitMs) {
        submit(stage.attempt.mode === "words" ? (inputRef.current?.value ?? "") : "");
      }
    }, 100);
    return () => clearInterval(tick);
  }, [stage]);

  // Keep the page behind from scrolling while the try is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const cheat = (reason: string) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    submit("", reason);
  };
  // Shared by both modes' inputs: no pasting, dropping, or menus.
  const guard = {
    onBeforeInput: (e: React.FormEvent) => {
      const type = (e.nativeEvent as InputEvent).inputType;
      if (type === "insertFromPaste" || type === "insertFromDrop" || type === "insertFromYank") {
        cheat("You pasted text")(e);
      }
    },
    onPaste: cheat("You pasted text"),
    onDrop: cheat("You dropped text in"),
    onContextMenu: (e: React.SyntheticEvent) => e.preventDefault(),
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "none",
    spellCheck: false,
  } as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950/95 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-10 backdrop-blur-md sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
              {territory.name}
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-slate-50 sm:text-4xl">{territory.reference}</h2>
          </div>
          {!typing && stage.kind !== "checking" && stage.kind !== "starting" && (
            <button
              type="button"
              onClick={() => onClose(stage.kind === "done")}
              className="grid size-11 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-wash hover:text-slate-100"
              aria-label="Back to the map"
            >
              <Icon name="close" className="size-5" />
            </button>
          )}
        </div>
        <div className="ex-bells mt-4 mb-6" aria-hidden />

        {(stage.kind === "ready" || stage.kind === "starting") && (
          <div className="space-y-5">
            <p className="text-slate-300">
              {holder
                ? holder.isMe
                  ? `You hold ${territory.name} with ${holder.soldiers} of ${MAX_POINTS} soldiers. Score higher to add more.`
                  : `${holder.name} holds ${territory.name} with ${holder.soldiers} of ${MAX_POINTS} soldiers. Score ${holder.soldiers} or more to take it.`
                : `No one holds ${territory.name} yet. Score 1 or more to claim it.`}
            </p>
            <div>
              <div role="radiogroup" aria-label="How to answer" className="inline-flex gap-1 rounded-xl border border-line bg-wash p-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === m.id}
                    onClick={() => setMode(m.id)}
                    className={`min-h-10 rounded-lg px-3.5 text-sm font-semibold transition ${
                      mode === m.id ? "bg-amber-400 text-ink shadow" : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {MODES.find((m) => m.id === mode)?.help} Both ways score the same.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <Rule>The verse won’t be shown ahead of time. Answer from memory. Capitals and punctuation don’t count.</Rule>
              <Rule>
                You start with {MAX_POINTS} points. Each {mode === "letters" ? "wrong letter" : "wrong, missing, or extra word"}{" "}
                costs one, and what’s left is your soldiers.
              </Rule>
              <Rule>There’s a time limit, kept by the server, that starts when you press Start. Take your time thinking.</Rule>
              {fullScreen && <Rule>On a computer the try goes full screen. Leaving full screen ends it.</Rule>}
              <Rule>Leaving this screen, switching apps or windows, or pasting ends the try with nothing.</Rule>
              <Rule>Score nothing and you can try this territory again after a minute.</Rule>
            </ul>
            {/* The honor pledge: Start waits until it's made. */}
            <label
              className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                pledged ? "border-[var(--ex-gold)] bg-amber-400/8" : "border-[var(--ex-rule)] hover:bg-wash"
              }`}
            >
              <input
                type="checkbox"
                checked={pledged}
                onChange={(e) => setPledged(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-amber-400"
              />
              <span>
                <span className="block font-display text-lg font-semibold text-slate-50">My honor pledge</span>
                <span className="block text-sm text-slate-300">
                  I’m answering from memory, with no Bible, notes, or help from anyone.
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={begin}
              disabled={!pledged || stage.kind === "starting"}
              className={buttonClass}
            >
              {stage.kind === "starting" ? "Starting…" : "Start"}
            </button>
          </div>
        )}

        {stage.kind === "typing" && stage.attempt.mode === "letters" && (
          <div>
            <Clock elapsed={now} limit={stage.attempt.limitMs} />
            <LettersBoard
              attempt={stage.attempt}
              inputRef={inputRef}
              guard={guard}
              onCheat={(reason) => submit("", reason)}
              onDone={() => submit("")}
            />
          </div>
        )}

        {stage.kind === "typing" && stage.attempt.mode === "words" && (
          <div>
            <Clock elapsed={now} limit={stage.attempt.limitMs} />
            <textarea
              ref={inputRef}
              value={answer}
              onChange={(e) => {
                const next = e.target.value;
                if (next.length - answer.length > MAX_JUMP) return submit("", "Too much text arrived at once");
                setAnswer(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(answer);
                }
              }}
              {...guard}
              rows={6}
              enterKeyHint="done"
              aria-label={`Type ${stage.attempt.reference} from memory`}
              placeholder={`${stage.attempt.words} words…`}
              className="mt-4 block w-full resize-none border border-[var(--ex-rule)] bg-night-900/80 p-4 font-display text-xl leading-relaxed text-slate-50 placeholder:text-slate-600 focus:border-[var(--ex-gold)] focus:outline-none sm:text-2xl"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {answer.trim() ? answer.trim().split(/\s+/).length : 0} of {stage.attempt.words} words
              </p>
              <button type="button" onClick={() => submit(answer)} className={buttonClass}>
                Done
              </button>
            </div>
          </div>
        )}

        {stage.kind === "checking" && <p className="py-10 text-center text-slate-400">Checking…</p>}

        {stage.kind === "error" && (
          <div className="space-y-5">
            <p className="text-rose-300">{stage.message}</p>
            <button type="button" onClick={() => onClose(false)} className={secondaryButtonClass}>
              Back to the map
            </button>
          </div>
        )}

        {stage.kind === "done" && (
          <Outcome outcome={stage.outcome} reason={stage.reason} territory={territory} onClose={() => onClose(true)} />
        )}
      </div>
    </div>
  );
}

/**
 * First letters: the player types one letter per word. Each goes to the
 * server in order, and the word comes back to be shown, in red if the letter
 * was wrong. The shields above count down with every mistake. Letters typed
 * ahead of the server wait in line as dots.
 */
function LettersBoard({
  attempt,
  inputRef,
  guard,
  onCheat,
  onDone,
}: {
  attempt: StartedTry;
  inputRef: React.RefObject<HTMLTextAreaElement & HTMLInputElement | null>;
  guard: Record<string, unknown>;
  onCheat: (reason: string) => void;
  onDone: () => void;
}) {
  const [words, setWords] = useState<{ word: string; right: boolean }[]>([]);
  const [waiting, setWaiting] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const sent = useRef(0);
  const line = useRef<Promise<void>>(Promise.resolve());
  const over = useRef(false);

  function finish() {
    if (over.current) return;
    over.current = true;
    onDone();
  }

  function send(letter: string) {
    if (over.current || sent.current >= attempt.words) return;
    const index = sent.current++;
    setWaiting((n) => n + 1);
    line.current = line.current.then(async () => {
      if (over.current) return;
      try {
        const res = await typeLetter(attempt.attemptId, index, letter);
        if (!res.ok) return finish();
        setWords((w) => [...w, { word: res.word, right: res.right }]);
        setMistakes(res.mistakes);
        if (res.done) finish();
      } catch {
        finish();
      } finally {
        setWaiting((n) => n - 1);
      }
    });
  }

  return (
    <div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <Soldiers score={Math.max(0, MAX_POINTS - mistakes)} small />
        <p className="text-sm text-slate-500 tabular-nums">
          {words.length} of {attempt.words} words
        </p>
      </div>
      {/* The verse so far, word by word, with a gold caret where the next letter goes. */}
      <p
        className="mt-4 min-h-32 border-y border-[var(--ex-rule)] py-5 font-display text-2xl leading-relaxed text-slate-50 sm:text-3xl"
        onClick={() => inputRef.current?.focus()}
      >
        {words.map((w, i) => (
          <span key={i}>
            <span className={w.right ? "" : "text-rose-300 underline decoration-rose-400/70 decoration-wavy underline-offset-4"}>
              {w.word}
            </span>{" "}
          </span>
        ))}
        {Array.from({ length: waiting }, (_, i) => (
          <span key={`w${i}`} className="text-slate-500">
            •{" "}
          </span>
        ))}
        <span className="inline-block h-[1em] w-0.5 translate-y-1 bg-amber-400 motion-safe:animate-pulse" aria-hidden />
      </p>
      <input
        ref={inputRef}
        value=""
        onChange={(e) => {
          const typed = e.target.value;
          if (typed.length > 3) return onCheat("Too much text arrived at once");
          for (const ch of typed.toLowerCase()) if (/[a-z0-9]/.test(ch)) send(ch);
        }}
        {...guard}
        enterKeyHint="next"
        aria-label={`First letter of each word of ${attempt.reference}`}
        placeholder="Type the first letter of each word"
        className="mt-4 block w-full rounded-xl border border-[var(--ex-rule)] bg-night-900/80 px-4 py-3 text-center text-lg text-slate-50 placeholder:text-slate-600 focus:border-[var(--ex-gold)] focus:outline-none"
      />
    </div>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-[var(--ex-gold-soft)]" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

/** Time used against the limit, as a draining bar. */
function Clock({ elapsed, limit }: { elapsed: number; limit: number }) {
  const left = Math.max(0, limit - elapsed);
  const share = left / limit;
  return (
    <div>
      <div className="flex items-baseline justify-between font-display tabular-nums">
        <span className="text-3xl font-semibold text-slate-50">{formatSeconds(elapsed)}</span>
        <span className={share < 0.2 ? "text-rose-300" : "text-slate-500"}>{formatSeconds(left)} left</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden bg-wash">
        <div
          className={`h-full transition-[width] duration-100 ${share < 0.2 ? "bg-rose-400" : "bg-[var(--ex-gold)]"}`}
          style={{ width: `${share * 100}%` }}
        />
      </div>
    </div>
  );
}

function Outcome({
  outcome,
  reason,
  territory,
  onClose,
}: {
  outcome: FinishedTry;
  reason?: string;
  territory: Territory;
  onClose: () => void;
}) {
  const words = outcome.text.split(/\s+/);
  const { score, before, after } = outcome;
  const heading = {
    claimed: `${territory.name} is yours`,
    taken: `You took ${territory.name}`,
    strengthened: `${territory.name} is stronger`,
    kept: `You still hold ${territory.name}`,
    "held-off": `${before?.name ?? "They"} held ${territory.name}`,
    nothing: {
      passed: "Well done",
      missed: "No soldiers this time",
      timeout: "Out of time",
      voided: "Try voided",
    }[outcome.result],
  }[outcome.outcome];
  const detail = {
    claimed: `It’s held by ${plural(score, "soldier")}.`,
    taken: `You took it from ${before?.name} with ${plural(score, "soldier")}.`,
    strengthened: `It now has ${plural(after?.soldiers ?? score, "soldier")}, up from ${before?.soldiers}.`,
    kept: `It keeps its ${plural(after?.soldiers ?? score, "soldier")}; a score above that adds more.`,
    "held-off": `They have ${plural(before?.soldiers ?? 0, "soldier")}, so you needed ${before?.soldiers} or more.`,
    nothing: {
      passed: `That’s ${plural(score, "soldier")}, but teachers don’t hold territories.`,
      missed: `${MAX_POINTS} or more mistakes leaves no soldiers. Study it and try again in a minute.`,
      timeout: `The limit for this verse is ${formatSeconds(outcome.limitMs)}, so the try doesn’t count.`,
      voided: `${reason ?? "The try was ended"}, so it doesn’t count.`,
    }[outcome.result],
  }[outcome.outcome];
  const won = outcome.outcome === "claimed" || outcome.outcome === "taken" || outcome.outcome === "strengthened";

  return (
    <div className="space-y-6">
      <div>
        <Soldiers score={score} />
        <p className="mt-3 font-display text-3xl font-semibold text-slate-50">{heading}</p>
        <p className="mt-1 text-slate-400">{detail}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Mark tone={won ? "green" : score > 0 ? "gold" : "red"}>
            {score} of {MAX_POINTS} points
          </Mark>
          <Mark>{outcome.mistakes === 0 ? "No mistakes" : plural(outcome.mistakes, "mistake")}</Mark>
        </div>
      </div>
      {/* The verse itself, now that the try is over, with every mistake marked. */}
      <div>
        <blockquote className="border-y border-[var(--ex-rule)] py-6 font-display text-xl leading-relaxed text-slate-100 sm:text-2xl">
          {words.map((w, i) => {
            const mark = outcome.marks[i];
            return (
              <span key={i}>
                <span
                  className={
                    mark === "wrong"
                      ? "text-rose-300 underline decoration-rose-400/70 decoration-wavy underline-offset-4"
                      : mark === "missing"
                        ? "text-orange-300 underline decoration-orange-400/70 decoration-dotted underline-offset-4"
                        : ""
                  }
                  title={mark === "wrong" ? "Typed wrong" : mark === "missing" ? "Left out" : undefined}
                >
                  {w}
                </span>{" "}
              </span>
            );
          })}
        </blockquote>
        {outcome.mistakes > 0 && (
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>
              <span className="text-rose-300 underline decoration-wavy">wavy</span>: typed wrong
            </span>
            <span>
              <span className="text-orange-300 underline decoration-dotted">dotted</span>: left out
            </span>
            {outcome.extra > 0 && <span>{plural(outcome.extra, "extra word")} not in the verse</span>}
          </p>
        )}
      </div>
      <button type="button" onClick={onClose} className={buttonClass}>
        Back to the map
      </button>
    </div>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The score as a row of soldiers: lit for each point kept. */
function Soldiers({ score, small }: { score: number; small?: boolean }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`${score} of ${MAX_POINTS} soldiers`}>
      {Array.from({ length: MAX_POINTS }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`${small ? "size-7" : "size-8"} transition-colors duration-300 ${i < score ? "text-[var(--ex-gold)]" : "text-slate-700"}`}
          aria-hidden
        >
          {/* A round shield with a spear behind it. */}
          <path d="M4 21 20 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="12" r="6.5" fill="currentColor" fillOpacity={i < score ? 0.25 : 0.1} stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
