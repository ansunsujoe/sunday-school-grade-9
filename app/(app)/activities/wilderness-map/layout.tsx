import Link from "next/link";
import { Icon } from "@/components/icons";
import { GameNav } from "../../exodus/game-nav";

export default function WildernessMapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wm-stage ex-scope mx-auto max-w-[96rem]">
      {/* Tucked away during a game on large screens, to give the map the height (see .wm-chrome). */}
      <div className="wm-chrome">
        <Link
          href="/activities"
          className="relative mb-2 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-100"
        >
          <Icon name="arrowLeft" className="size-4" /> Activities
        </Link>
        <header className="mb-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex items-baseline gap-3">
            <p className="font-display text-2xl font-semibold tracking-tight text-slate-50">Where in the Wilderness?</p>
            <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
              Find the place
            </p>
          </div>
          {/* Masei, "Journeys": the reading that lists every camp (Numbers 33). */}
          <p lang="he" dir="rtl" className="font-display text-xl text-[var(--ex-gold)] opacity-60" title="Masei (Journeys)">
            מַסְעֵי
          </p>
        </header>
        <div className="ex-bells mb-4" aria-hidden />
        <GameNav
          links={[
            { href: "/activities/wilderness-map", label: "Play", exact: true },
            { href: "/activities/wilderness-map/leaderboard", label: "Leaderboard" },
          ]}
        />
      </div>
      {children}
    </div>
  );
}
