import { getLeaderboard } from "@/lib/activities/leaderboard";
import { PLACES } from "@/lib/activities/places";
import { requireUser } from "@/lib/dal";
import { getClans, getCouncilUnread, getPlayer } from "@/lib/exodus/queries";
import { CampScene, MapScene } from "./art";
import { ActivityCard } from "./activity-card";

export default async function ActivitiesPage() {
  const user = await requireUser();
  const [player, clans, board] = await Promise.all([getPlayer(), getClans(), getLeaderboard()]);
  const unread = await getCouncilUnread(player);
  const mine = board.find((row) => row.userId === user.id);
  const people = clans.reduce((sum, c) => sum + c.people, 0);

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
            href="/exodus"
            tag="Class game"
            title="The Exodus"
            summary="Lead your clan through the wilderness: gather manna, keep your people, and settle matters in the council."
            art={<CampScene className="size-full" />}
            alert={unread > 0 ? `${unread} waiting at the tents` : undefined}
            emblems
            stats={
              clans.length
                ? [
                    { label: "In the camp", value: people.toLocaleString() },
                    { label: "Clans", value: String(clans.length) },
                    {
                      label: "Council",
                      value: unread ? `${unread} new` : "All quiet",
                      tone: unread ? "gold" : undefined,
                    },
                  ]
                : [{ label: "The camp", value: "Not set out yet" }]
            }
          />
        </li>
        <li className="art-in [animation-delay:120ms]">
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
      </ul>
    </div>
  );
}
