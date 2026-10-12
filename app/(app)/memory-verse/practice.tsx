"use client";

import { useRef, useState } from "react";
import { buttonClass, inputClass, secondaryButtonClass } from "@/components/ui";

type Mode = "read" | "letters" | "words";

const MODES: { id: Mode; label: string; help: string }[] = [
  { id: "read", label: "Read", help: "Read it out loud a few times before you practice." },
  { id: "letters", label: "First letters", help: "Type just the first letter of each word. Punctuation is filled in for you." },
  { id: "words", label: "Whole words", help: "Type each word, then press space. Capitals and punctuation don't count." },
];

/** Answer key for a word: lowercase letters and digits only, so case and punctuation never count against you. */
function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

type Word = { lead: string; core: string; trail: string; key: string };

/**
 * Splits a verse into words, keeping each word's punctuation apart so it can
 * stay on screen while the word itself is hidden. A token with no letters
 * (like a lone dash) joins the word before it rather than becoming a blank.
 */
function toWords(text: string) {
  const words: Word[] = [];
  let pending = "";
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const [, lead, core, trail] = token.match(/^([^a-z0-9]*)(.*?)([^a-z0-9]*)$/i)!;
    const key = normalize(core);
    if (!key) {
      const last = words.at(-1);
      if (last) last.trail += ` ${token}`;
      else pending += `${token} `;
      continue;
    }
    words.push({ lead: pending + lead, core, trail, key });
    pending = "";
  }
  return words;
}

/** What was typed for each word so far; `hint` means the student asked to be shown it. */
type Attempt = { typed: string; right: boolean; hint?: boolean };

/**
 * Memory verse practice, after the Bible Memory app: the verse is hidden and
 * revealed word by word as you type it, and every miss is marked in place.
 */
export function VersePractice({ text, reference }: { text: string; reference: string }) {
  const words = toWords(text);
  const [mode, setMode] = useState<Mode>("read");
  const [showWords, setShowWords] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const done = attempts.length === words.length;
  const current = words[attempts.length];
  // In whole-word mode, flag a wrong turn as soon as the typing stops matching.
  const offTrack = mode === "words" && !!current && !current.key.startsWith(normalize(input));

  function restart(next: Mode = mode) {
    setMode(next);
    setAttempts([]);
    setInput("");
    if (next !== "read") requestAnimationFrame(() => inputRef.current?.focus());
  }

  function record(attempt: Attempt) {
    setAttempts((a) => [...a, attempt]);
    setInput("");
  }

  function commitWord(typed: string) {
    if (!current || !normalize(typed)) return;
    record({ typed, right: normalize(typed) === current.key });
  }

  function onChange(value: string) {
    if (!current) return;
    if (mode === "letters") {
      const letter = normalize(value).at(-1);
      if (letter) record({ typed: letter, right: letter === current.key[0] });
      else setInput("");
      return;
    }
    if (/\s$/.test(value)) commitWord(value.trim());
    else setInput(value);
  }

  const misses = attempts
    .map((a, i) => ({ ...a, word: words[i].core }))
    .filter((a) => !a.right);
  const correct = attempts.length - misses.length;

  return (
    <div>
      <div role="tablist" aria-label="Practice mode" className="inline-flex gap-1 rounded-xl border border-line bg-wash p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => restart(m.id)}
            className={`min-h-10 rounded-lg px-3.5 text-sm font-semibold transition ${
              mode === m.id ? "bg-amber-400 text-ink shadow" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-400">{MODES.find((m) => m.id === mode)?.help}</p>

      <section className="mt-5 rounded-2xl border border-amber-300/15 bg-night-900/70 p-5 shadow-xl shadow-black/20 sm:p-8">
        {mode === "read" ? (
          <p className="font-display text-2xl leading-relaxed font-medium text-balance text-slate-50 sm:text-3xl">
            {text}
          </p>
        ) : (
          <p
            className="font-display text-2xl leading-relaxed font-medium text-slate-50 sm:text-3xl"
            onClick={() => inputRef.current?.focus()}
          >
            {words.map((w, i) => {
              const a = attempts[i];
              if (a) {
                return (
                  <span key={i}>
                    {w.lead}
                    <span
                      className={a.right ? "" : "text-rose-300 underline decoration-rose-400/70 decoration-wavy underline-offset-4"}
                      title={a.right ? undefined : a.hint ? "You asked for this one" : `You typed “${a.typed}”`}
                    >
                      {w.core}
                    </span>
                    {w.trail}{" "}
                  </span>
                );
              }
              const isCurrent = i === attempts.length;
              return (
                <span key={i}>
                  <span className="text-slate-400">{w.lead}</span>
                  {showWords ? (
                    <span
                      className={`text-slate-500/50 ${isCurrent ? "underline decoration-amber-400 decoration-2 underline-offset-8" : ""}`}
                    >
                      {w.core}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={`inline-block h-[1em] translate-y-1 border-b-2 align-baseline ${
                        isCurrent ? "border-amber-400 motion-safe:animate-pulse" : "border-line-strong"
                      }`}
                      style={{ width: `${Math.max(w.core.length, 2) * 0.55}em` }}
                    />
                  )}
                  <span className="text-slate-400">{w.trail}</span>{" "}
                </span>
              );
            })}
          </p>
        )}
        <p className="mt-4 text-sm font-medium text-amber-200/90">{reference} · KJV</p>
      </section>

      {mode !== "read" && !done && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitWord(input);
              }
            }}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            aria-label={mode === "letters" ? "First letter of the next word" : "Next word"}
            placeholder={mode === "letters" ? "Type the first letter…" : "Type the next word…"}
            className={`${inputClass} max-w-xs flex-1 ${
              offTrack ? "border-rose-400/60 focus:border-rose-400/60 focus:ring-rose-400/20" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => {
              record({ typed: "", right: false, hint: true });
              inputRef.current?.focus();
            }}
            className={secondaryButtonClass}
          >
            Show me
          </button>
          <label className="flex min-h-11 items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showWords}
              onChange={(e) => {
                setShowWords(e.target.checked);
                inputRef.current?.focus();
              }}
              className="size-4 accent-amber-400"
            />
            Show the words faintly
          </label>
          <span className="ml-auto text-sm text-slate-500 tabular-nums">
            {attempts.length} / {words.length}
          </span>
        </div>
      )}

      {mode !== "read" && done && (
        <div className="mt-5">
          <p className="font-display text-xl font-semibold text-slate-50">
            {misses.length === 0
              ? "Perfect! Every word right."
              : `${correct} of ${words.length} words right.`}
          </p>
          {misses.length > 0 && (
            <>
              <h2 className="mt-4 text-sm font-semibold text-slate-300">Where you went wrong</h2>
              <ul className="mt-2 divide-y divide-line-faint text-sm">
                {misses.map((m, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-2 py-2">
                    <span className="font-semibold text-slate-100">{m.word}</span>
                    <span className="text-slate-500">
                      {m.hint ? (
                        "you asked to be shown this one"
                      ) : (
                        <>
                          you typed <span className="text-rose-300 line-through">{m.typed}</span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => restart()} className={buttonClass}>
              Try again
            </button>
            {showWords && (
              <button
                type="button"
                onClick={() => {
                  setShowWords(false);
                  restart();
                }}
                className={secondaryButtonClass}
              >
                Try without seeing the words
              </button>
            )}
            {mode === "letters" && (
              <button type="button" onClick={() => restart("words")} className={secondaryButtonClass}>
                Now type whole words
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
