import { getLeaderboard } from "@/lib/activities/leaderboard";
import { PLACES } from "@/lib/activities/places";
import { requireUser } from "@/lib/dal";
import { getHolders } from "@/lib/verse-map/queries";
import { TERRITORIES } from "@/lib/verse-map/map";
import { MapScene, WorldScene } from "./art";
import { ActivityCard } from "./activity-card";

export default async function ActivitiesPage() {
  const user = await requireUser();
  const [board, holders] = await Promise.all([getLeaderboard(), getHolders()]);
  const mineHeld = holders.filter((h) => h.userId === user.id);
  const held = mineHeld.length;
  const soldiers = mineHeld.reduce((sum, h) => sum + h.soldiers, 0);
  const mine = board.find((row) => row.userId === user.id);

  return (
    <div className="ex-scope">
      <header className="mb-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
            Games for the journey
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Activities
          </h1>
        </div>
      </header>
      <div className="ex-bells mt-3 mb-6" aria-hidden />

      <ul className="grid gap-6 md:grid-cols-2 xl:max-w-6xl">
        <li className="art-in">
          <ActivityCard
            href="/activities/wilderness-map"
            tag="Map game"
            title="Where in the Wilderness?"
            summary="Read a clue, then find where it happened on the road from Succoth to Kadesh. Quick answers score more."
            art={<MapScene className="size-full" />}
            stats={[
              { label: "Your best", value: mine ? mine.score.toLocaleString() : "Not played" },
              {
                label: "Your rank",
                value: mine ? `#${mine.rank} of ${board.length}` : board.length ? `${board.length} on the board` : "—",
                tone: mine && mine.rank <= 3 ? "gold" : undefined,
              },
              { label: "Places", value: String(PLACES.length) },
            ]}
          />
        </li>
        <li className="art-in [animation-delay:120ms]">
          <ActivityCard
            href="/activities/world"
            tag="Memory verses"
            title="Verse Royale"
            summary="Every territory is a verse. Type it from memory: each mistake costs a soldier. Match or beat the holder's soldiers to take their ground."
            art={<WorldScene className="size-full" />}
            stats={[
              { label: "You hold", value: user.role === "teacher" ? "—" : `${held} of ${TERRITORIES.length}` },
              { label: "Claimed", value: `${holders.length} of ${TERRITORIES.length}` },
              ...(user.role === "teacher" ? [] : [{ label: "Your soldiers", value: String(soldiers), tone: soldiers ? ("gold" as const) : undefined }]),
            ]}
          />
        </li>
      </ul>
    </div>
  );
}
