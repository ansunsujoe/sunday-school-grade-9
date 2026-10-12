import Link from "next/link";
import { describeChanges } from "@/lib/exodus/resources";
import { MANNA_TIME_ZONE } from "@/lib/exodus/manna";
import type { ThreadListItem } from "@/lib/exodus/queries";
import { timeAgo } from "@/lib/format";
import { PersonaSeal } from "./persona-seal";

export { PersonaSeal };

/** A time of day on the camp clock, e.g. "6:42 PM". */
export function campTime(date: Date) {
  return date.toLocaleTimeString("en-US", { timeZone: MANNA_TIME_ZONE, hour: "numeric", minute: "2-digit" });
}

/** Who has come to the tent: each thread with its last word and how many are unread. */
export function ThreadList({
  threads,
  activeId,
  asTeacher = false,
  emptyText,
}: {
  threads: ThreadListItem[];
  activeId?: number;
  /** Teachers read the leader's replies; leaders read their own. */
  asTeacher?: boolean;
  emptyText: string;
}) {
  if (threads.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-slate-500">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-line-faint">
      {threads.map((t) => {
        const active = t.id === activeId;
        const unread = t.unread > 0;
        return (
          <li key={t.id}>
            <Link
              href={`/exodus/council/${t.id}`}
              className={`relative flex gap-3 px-4 py-3.5 transition ${active ? "bg-amber-400/[0.08]" : "hover:bg-wash"}`}
            >
              {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--ex-gold)]" aria-hidden />}
              <PersonaSeal name={t.persona} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span
                    className={`min-w-0 flex-1 truncate font-display text-[15px] ${unread ? "font-bold text-slate-50" : "font-semibold text-slate-200"}`}
                  >
                    {t.persona}
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(t.lastMessageAt)}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className={`line-clamp-1 flex-1 text-sm ${unread ? "text-slate-200" : "text-slate-500"}`}>
                    {t.lastFromLeader && <span className="text-slate-500">{asTeacher ? "Leader: " : "You: "}</span>}
                    {/* Supply changes lead the preview, e.g. "+50 Gold, −20 Goats · Quail at evening". */}
                    {t.lastChanges ? `${describeChanges(t.lastChanges)} · ${t.lastBody}` : t.lastBody}
                  </span>
                  {unread && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center bg-amber-400 px-1.5 text-[11px] font-bold text-ink">
                      {t.unread}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
