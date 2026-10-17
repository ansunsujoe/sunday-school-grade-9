import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { getLeaderboard, type LeaderRow } from "@/lib/activities/leaderboard";
import { requireUser } from "@/lib/dal";
import { Dunes, Mark, Panel } from "../../../exodus/ornaments";
import { Standings, formatSeconds } from "../standings";

export default async function LeaderboardPage() {
  const user = await requireUser();
  const rows = await getLeaderboard();
  const podium = rows.slice(0, 3);

  return (
    <div className="space-y-8">
      {podium.length > 0 && (
        <section className="ex-panel overflow-hidden">
          <div className="pointer-events-none absolute -top-28 left-1/2 size-80 -translate-x-1/2 rounded-full bg-amber-400/12 blur-3xl" />
          <Dunes />
          {/* Second, first, third, like a podium. */}
          <div className="relative grid grid-cols-3 items-end gap-2 px-3 pt-8 pb-10 sm:gap-6 sm:px-8 sm:pb-14">
            {[podium[1], podium[0], podium[2]].map((row, i) =>
              row ? <Step key={row.userId} row={row} me={row.userId === user.id} order={i} /> : <span key={i} />,
            )}
          </div>
        </section>
      )}

      <Panel
        title="Every traveller"
        action={
          <Link href="/activities/wilderness-map" className={`${buttonClass} min-h-9 px-4`}>
            Play
          </Link>
        }
      >
        <p className="-mt-2 mb-3 text-sm text-slate-500">
          Each player&apos;s best game. Ties go to the faster journey.
        </p>
        <Standings rows={rows} userId={user.id} />
      </Panel>
    </div>
  );
}

const STEP = [
  { height: "h-20 sm:h-28", tone: "text-slate-300", delay: 250 },
  { height: "h-28 sm:h-40", tone: "text-amber-300", delay: 0 },
  { height: "h-14 sm:h-20", tone: "text-orange-300", delay: 450 },
];

/** One block of the podium, rising into place. */
function Step({ row, me, order }: { row: LeaderRow; me: boolean; order: number }) {
  const s = STEP[order];
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="wm-rise min-w-0" style={{ animationDelay: `${s.delay + 350}ms` }}>
        <p className="truncate font-display text-base font-semibold text-slate-50 sm:text-xl">{row.name}</p>
        <p className="font-display text-lg font-semibold text-slate-200 tabular-nums sm:text-2xl">
          {row.score.toLocaleString()}
        </p>
        <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
          {row.found} of {row.rounds} · {formatSeconds(row.durationMs)}
        </p>
        <div className="mt-1 flex min-h-5 justify-center gap-1">
          {row.role === "teacher" && <Mark>Teacher</Mark>}
          {me && <Mark tone="gold">You</Mark>}
        </div>
      </div>
      <div
        className={`wm-grow mt-2 grid w-full place-items-start justify-center border border-b-0 border-[var(--ex-rule)] bg-[var(--ex-parchment)] pt-2 ${s.height}`}
        style={{ animationDelay: `${s.delay}ms` }}
      >
        <span className={`font-display text-3xl font-semibold sm:text-4xl ${s.tone}`}>{row.rank}</span>
      </div>
    </div>
  );
}
