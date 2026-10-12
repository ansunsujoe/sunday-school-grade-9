"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { markThreadRead, sendWord } from "@/lib/actions/exodus";
import { MAX_WORD_LENGTH } from "@/lib/exodus/council";
import { MANNA_TIME_ZONE } from "@/lib/exodus/manna";
import type { CouncilMessage } from "@/lib/exodus/queries";
import { Glyph } from "../ornaments";
import { Ledger } from "./ledger";

type Message = CouncilMessage & { pending?: boolean };

// Each message is an ostracon: a shard of pottery with chipped corners, the way
// letters were sent in ancient Israel. The character's shards lean one way, the leader's the other.
const SHARD_THEIRS =
  "polygon(0 6px, 6px 0, calc(100% - 13px) 0, 100% 9px, 100% calc(100% - 4px), calc(100% - 7px) 100%, 11px 100%, 0 calc(100% - 8px))";
const SHARD_MINE =
  "polygon(0 9px, 13px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 8px), calc(100% - 11px) 100%, 7px 100%, 0 calc(100% - 4px))";

/** What a message's link says, from where it goes and what it carries. */
function linkLabel({ href, changes }: Pick<Message, "href" | "changes">) {
  if (href?.startsWith("/exodus/news")) return "Read the news →";
  if (changes) return "See your supplies →";
  if (href?.includes("#supplies")) return "Collect the manna →";
  return "See your camp →";
}

/** How often to look for new messages while the thread is open. */
const POLL_MS = 5_000;

const dayOf = (d: Date) =>
  d.toLocaleDateString("en-US", { timeZone: MANNA_TIME_ZONE, weekday: "long", month: "short", day: "numeric" });
const timeOf = (d: Date) =>
  d.toLocaleTimeString("en-US", { timeZone: MANNA_TIME_ZONE, hour: "numeric", minute: "2-digit" });

/**
 * A live conversation between a clan's leader and one character. `side` is
 * who's looking: the leader writes as themselves, a teacher writes as the
 * character. Refreshes itself every few seconds and marks what's seen as read.
 */
export function Conversation({
  threadId,
  persona,
  side,
  messages,
  seal,
  leaderSeal,
}: {
  threadId: number;
  persona: string;
  side: "leader" | "teacher";
  messages: CouncilMessage[];
  /** The character's seal, drawn on the server. */
  seal: React.ReactNode;
  /** The clan's emblem, for the leader's side. */
  leaderSeal: React.ReactNode;
}) {
  const router = useRouter();
  const [shown, addPending] = useOptimistic<Message[], Message>(messages, (state, m) => [...state, m]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const lastId = messages.at(-1)?.id;

  // Look for new messages, but only while the page is in front of someone.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  // Whatever arrives while the thread is open has been seen.
  useEffect(() => {
    if (lastId !== undefined) markThreadRead(threadId);
  }, [threadId, lastId]);

  // Keep the newest message in view.
  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [shown.length]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setError(null);
    startTransition(async () => {
      addPending({
        id: -Date.now(),
        fromLeader: side === "leader",
        kind: "word",
        body,
        href: null,
        changes: null,
        createdAt: new Date(),
        pending: true,
      });
      const result = await sendWord(threadId, body);
      if (result?.error) {
        setError(result.error);
        setDraft(body);
      }
    });
    boxRef.current?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ol className="flex-1 space-y-1 px-3 py-5 sm:px-6 lg:overflow-y-auto">
        {shown.map((m, i) => {
          // Mark each new day, and run consecutive shards from the same side together.
          const prev = shown[i - 1];
          const day = dayOf(m.createdAt);
          const newDay = !prev || dayOf(prev.createdAt) !== day;
          const joined =
            !newDay &&
            prev.kind === "word" &&
            m.kind === "word" &&
            prev.fromLeader === m.fromLeader &&
            m.createdAt.getTime() - prev.createdAt.getTime() < 5 * 60_000;
          return (
            <li key={m.id}>
              {newDay && <DayRule label={day} />}
              {m.kind === "notice" ? (
                <Notice message={m} persona={persona} />
              ) : (
                <Shard
                  message={m}
                  mine={side === "leader" ? m.fromLeader : !m.fromLeader}
                  joined={joined}
                  seal={m.fromLeader ? leaderSeal : seal}
                  who={m.fromLeader ? (side === "leader" ? "You" : "The leader") : persona}
                />
              )}
            </li>
          );
        })}
        <div ref={endRef} />
      </ol>

      <form
        className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 border-t border-[var(--ex-rule)] bg-night-900 p-3 sm:p-4 md:bottom-0"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        {error && <p className="mb-2 text-sm text-rose-300">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            ref={boxRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={MAX_WORD_LENGTH}
            placeholder={side === "leader" ? `Answer ${persona}…` : `Speak as ${persona}…`}
            aria-label={side === "leader" ? `Your answer to ${persona}` : `Message as ${persona}`}
            className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none border border-line bg-night-950 px-3.5 py-2.5 text-base leading-6 text-slate-100 placeholder:text-slate-500 focus:border-[var(--ex-gold-soft)] focus:outline-none sm:text-sm"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex min-h-11 items-center gap-2 bg-linear-to-b from-amber-400 to-amber-500 px-4 text-sm font-semibold text-ink transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
          >
            <Glyph name="reed" className="size-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="mt-1.5 hidden text-[11px] text-slate-500 sm:block">
          Enter to send · Shift+Enter for a new line
          {side === "teacher" && ` · The leader sees this as ${persona}`}
        </p>
      </form>
    </div>
  );
}

function DayRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-4 text-[var(--ex-gold)]" aria-label={label}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[var(--ex-rule)]" />
      <span className="font-display text-[11px] font-semibold tracking-[0.2em] uppercase opacity-80">{label}</span>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[var(--ex-rule)]" />
    </div>
  );
}

/** A message on a pottery shard, with the speaker's seal at the start of a run. */
function Shard({
  message,
  mine,
  joined,
  seal,
  who,
}: {
  message: Message;
  mine: boolean;
  joined: boolean;
  seal: React.ReactNode;
  who: string;
}) {
  const clip = mine ? SHARD_MINE : SHARD_THEIRS;
  return (
    <div className={`flex items-start gap-2.5 ${mine ? "flex-row-reverse" : ""} ${joined ? "" : "pt-3"}`}>
      {/* The seal sits beside the speaker's name, at the top of their run. */}
      <div className="grid w-11 shrink-0 justify-items-center pt-3.5">{!joined && seal}</div>
      <div className={`flex max-w-[min(36rem,80%)] flex-col ${mine ? "items-end" : "items-start"}`}>
        {!joined && (
          <span className={`mb-1 px-1 font-display text-xs font-semibold ${mine ? "text-[var(--ex-gold)]" : "text-slate-400"}`}>
            {who}
          </span>
        )}
        <div
          className={`p-px ${mine ? "bg-[var(--ex-gold-soft)]" : "bg-line-strong"} ${message.pending ? "opacity-60" : ""}`}
          style={{ clipPath: clip }}
        >
          <div
            className={`px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap text-slate-100 ${mine ? "bg-[color-mix(in_oklab,var(--ex-gold)_14%,var(--night-900))]" : "bg-night-800"}`}
            style={{ clipPath: clip }}
          >
            {message.body}
            {message.changes && <Ledger changes={message.changes} className="mt-2" />}
          </div>
        </div>
        {message.href && !mine && (
          <Link href={message.href} className="mt-1 px-1 text-xs font-semibold text-[var(--ex-gold)] hover:underline">
            {linkLabel(message)}
          </Link>
        )}
        <span className="mt-0.5 px-1 text-[10px] text-slate-500 tabular-nums">
          {message.pending ? "Sending…" : timeOf(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

/** Word from the game itself (manna, hunger, supplies, news), set apart like a posted decree. */
function Notice({ message, persona }: { message: Message; persona: string }) {
  const grave = /died|nothing to eat|will die/.test(message.body);
  return (
    <div className="mx-auto my-3 max-w-xl text-center">
      <div
        className={`border-y border-dashed px-4 py-3 ${grave ? "border-rose-400/40 bg-rose-500/[0.06]" : "border-[var(--ex-rule)] bg-[var(--ex-parchment)]"}`}
      >
        <p
          className={`font-display text-[10px] font-semibold tracking-[0.25em] uppercase ${grave ? "text-rose-300" : "text-[var(--ex-gold)]"}`}
        >
          {persona} · {timeOf(message.createdAt)}
        </p>
        {message.changes && <Ledger changes={message.changes} className="mt-2 justify-center" />}
        <p className="mt-1.5 text-sm leading-6 text-slate-200">{message.body}</p>
        {message.href && (
          <Link href={message.href} className="mt-1 inline-block text-xs font-semibold text-[var(--ex-gold)] hover:underline">
            {linkLabel(message)}
          </Link>
        )}
      </div>
    </div>
  );
}
