import type { LeaderRow } from "@/lib/activities/leaderboard";
import { EmptyState } from "@/components/ui";
import { Mark } from "../../exodus/ornaments";

/** e.g. "8.4s", or "2m 05s" once past a minute. */
export function formatSeconds(ms: number) {
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${String(Math.floor(s % 60)).padStart(2, "0")}s`;
}

const MEDALS = ["text-amber-300", "text-slate-300", "text-orange-300"];

/** Players by their best game, the viewer's own row picked out. */
export function Standings({ rows, userId, compact }: { rows: LeaderRow[]; userId: number; compact?: boolean }) {
  if (rows.length === 0) {
    return <EmptyState>No one has played yet. Be the first on the board.</EmptyState>;
  }
  return (
    <ol className="divide-y divide-line-faint">
      {rows.map((row, i) => {
        const me = row.userId === userId;
        return (
          <li
            key={row.userId}
            className={`wm-rise flex items-center gap-3 py-2.5 ${me ? "-mx-2 bg-amber-400/8 px-2" : ""}`}
            style={{ animationDelay: `${Math.min(i, 12) * 50}ms` }}
          >
            <span
              className={`w-7 shrink-0 text-center font-display text-lg font-semibold tabular-nums ${
                MEDALS[row.rank - 1] ?? "text-slate-500"
              }`}
            >
              {row.rank}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="min-w-0 truncate font-medium text-slate-100">{row.name}</span>
                {row.role === "teacher" && <Mark>Teacher</Mark>}
                {me && <Mark tone="gold">You</Mark>}
              </span>
              {!compact && (
                <span className="block text-xs text-slate-500">
                  Found {row.found} of {row.rounds} · {formatSeconds(row.durationMs)} ·{" "}
                  {row.games === 1 ? "1 game" : `${row.games} games`}
                </span>
              )}
            </span>
            <span className="shrink-0 font-display text-lg font-semibold text-slate-50 tabular-nums">
              {row.score.toLocaleString()}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
