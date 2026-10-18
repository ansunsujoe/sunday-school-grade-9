import Link from "next/link";
import { Icon } from "@/components/icons";
import { getCouncilUnread, getPlayer } from "@/lib/exodus/queries";
import { GameNav } from "./game-nav";

export default async function ExodusLayout({ children }: { children: React.ReactNode }) {
  const player = await getPlayer();
  const unread = await getCouncilUnread(player);

  const links = [
    player.isTeacher
      ? { href: "/exodus", label: "Clans", match: "/exodus/clans" }
      : { href: "/exodus", label: "Camp" },
    ...(player.clan ? [{ href: `/exodus/clans/${player.clan}`, label: "My people" }] : []),
    { href: "/exodus/council", label: "Council", badge: unread },
    { href: "/exodus/news", label: "News" },
  ];

  return (
    <div className="ex-scope">
      <Link
        href="/activities"
        className="relative mb-2 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Activities
      </Link>
      <header className="mb-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-3">
          <p className="font-display text-2xl font-semibold tracking-tight text-slate-50">The Exodus</p>
          <p className="font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
            Out of Egypt
          </p>
        </div>
        {/* Shemot, "Names": the book's Hebrew title. */}
        <p lang="he" dir="rtl" className="font-display text-xl text-[var(--ex-gold)] opacity-60" title="Shemot (Exodus)">
          שְׁמוֹת
        </p>
      </header>
      <div className="ex-bells mb-4" aria-hidden />
      <GameNav links={links} />
      {children}
    </div>
  );
}
