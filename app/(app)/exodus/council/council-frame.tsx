import Link from "next/link";
import { Icon } from "@/components/icons";
import { CLANS, clanInfo, isClanSlug, type ClanSlug } from "@/lib/exodus/clans";
import { getThreads, type Player } from "@/lib/exodus/queries";
import { ClanLogo } from "../game-ui";
import { ThreadList } from "./council-ui";

/**
 * The council's two panes: who has come to the tent on the left, the open
 * conversation on the right. On phones only one shows at a time: the list on
 * /exodus/council, the conversation on a thread's own page.
 */
export async function CouncilFrame({
  player,
  activeId,
  clan,
  children,
}: {
  player: Player;
  activeId?: number;
  /** The clan whose tent a teacher is looking at. */
  clan?: string;
  children: React.ReactNode;
}) {
  // Teachers see one clan at a time. Without a pick, open the first clan with
  // something unread, so a new message is never hidden behind another clan.
  const all = await getThreads(player);
  const unread = new Map<string, number>();
  for (const t of all) unread.set(t.clanSlug, (unread.get(t.clanSlug) ?? 0) + t.unread);
  const filter: ClanSlug | undefined = !player.isTeacher
    ? undefined
    : isClanSlug(clan)
      ? clan
      : (CLANS.find((c) => (unread.get(c.slug) ?? 0) > 0) ?? CLANS[0]).slug;
  const threads = filter ? all.filter((t) => t.clanSlug === filter) : all;

  return (
    <div className="ex-panel grid lg:h-[calc(100dvh-15rem)] lg:min-h-[34rem] lg:grid-cols-[22rem_minmax(0,1fr)]">
      <aside
        className={`flex min-h-0 flex-col border-[var(--ex-rule)] lg:border-r ${activeId ? "hidden lg:flex" : "flex"}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--ex-rule)] px-4 py-3">
          <h2 className="ex-heading flex-1">{filter ? `${clanInfo(filter).name}'s tent` : "At your tent"}</h2>
          {player.isTeacher && (
            <Link
              href="/exodus/council/new"
              className="inline-flex min-h-9 items-center gap-1.5 border border-[var(--ex-gold-soft)] px-3 text-sm font-medium text-[var(--ex-gold)] hover:bg-amber-400/10"
            >
              <Icon name="plus" className="size-4" /> Raise a matter
            </Link>
          )}
        </div>
        {player.isTeacher && (
          <nav className="flex gap-1 overflow-x-auto border-b border-line-faint px-3 py-2" aria-label="Filter by clan">
            {CLANS.map((c) => (
              <Link
                key={c.slug}
                href={`/exodus/council?clan=${c.slug}`}
                title={c.name}
                className={`relative grid size-8 shrink-0 place-items-center ${filter === c.slug ? "bg-amber-400/10" : "opacity-60 hover:opacity-100"}`}
              >
                <ClanLogo clan={c} className="size-6 ring-1" />
                {(unread.get(c.slug) ?? 0) > 0 && (
                  <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-amber-400" aria-label="Unread" />
                )}
              </Link>
            ))}
          </nav>
        )}
        <div className="min-h-0 flex-1 lg:overflow-y-auto">
          <ThreadList
            threads={threads}
            activeId={activeId}
            asTeacher={player.isTeacher}
            emptyText={
              player.isTeacher
                ? "No one has come to this tent yet. Raise a matter to start."
                : "No one has come to your tent yet."
            }
          />
        </div>
      </aside>
      <section className={`min-h-0 flex-col ${activeId ? "flex" : "hidden lg:flex"}`}>{children}</section>
    </div>
  );
}
