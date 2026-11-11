import { requireUser } from "@/lib/dal";
import { getHolders, getPersonalBests, standingsFrom } from "@/lib/verse-map/queries";
import { WorldGame } from "./world-game";
import type { MapHolder } from "./world-map";

export default async function WorldPage() {
  const user = await requireUser();
  const [holders, bests] = await Promise.all([getHolders(), getPersonalBests(user.id)]);
  const byTerritory: Record<string, MapHolder> = Object.fromEntries(
    holders.map((h) => [h.territory, { userId: h.userId, name: h.name, clan: h.clan, soldiers: h.soldiers }]),
  );
  return (
    <WorldGame
      userId={user.id}
      isTeacher={user.role === "teacher"}
      holders={byTerritory}
      standings={standingsFrom(holders)}
      bests={bests}
    />
  );
}
