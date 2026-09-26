import { getPlayer, getUnreadNotificationCount } from "@/lib/exodus/queries";
import { GameNav } from "./game-nav";

export default async function ExodusLayout({ children }: { children: React.ReactNode }) {
  const player = await getPlayer();
  const unread = await getUnreadNotificationCount(player);

  const links = [
    player.isTeacher
      ? { href: "/exodus", label: "Clans", match: "/exodus/clans" }
      : { href: "/exodus", label: "Camp" },
    ...(player.clan ? [{ href: `/exodus/clans/${player.clan}`, label: "My people" }] : []),
    { href: "/exodus/scenarios", label: "Scenarios" },
    { href: "/exodus/news", label: "News" },
    { href: "/exodus/notifications", label: "Notifications", badge: unread },
  ];

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <p className="font-display text-xl font-semibold text-slate-50">The Exodus</p>
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-300/70 uppercase">Out of Egypt</p>
      </div>
      <GameNav links={links} />
      {children}
    </div>
  );
}
