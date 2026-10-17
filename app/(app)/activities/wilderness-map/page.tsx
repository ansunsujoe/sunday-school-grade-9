import { getLeaderboard, getPersonalBest } from "@/lib/activities/leaderboard";
import { requireUser } from "@/lib/dal";
import { WildernessMapGame } from "./game";

export default async function WildernessMapPage() {
  const user = await requireUser();
  const [leaders, mine] = await Promise.all([getLeaderboard(5), getPersonalBest(user.id)]);
  return <WildernessMapGame leaders={leaders} personalBest={mine.best} userId={user.id} />;
}
