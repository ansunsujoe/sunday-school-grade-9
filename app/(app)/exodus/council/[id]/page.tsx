import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { deleteThread } from "@/lib/actions/exodus";
import { clanInfo } from "@/lib/exodus/clans";
import { getPlayer, getThread } from "@/lib/exodus/queries";
import { ClanLogo, ClanTag } from "../../game-ui";
import { CouncilFrame } from "../council-frame";
import { PersonaSeal } from "../council-ui";
import { Conversation } from "../conversation";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const player = await getPlayer();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { thread, messages } = await getThread(player, id);
  const clan = clanInfo(thread.clanSlug);

  return (
    <CouncilFrame player={player} activeId={id} clan={player.isTeacher ? thread.clanSlug : undefined}>
      <header className="flex items-center gap-3 border-b border-[var(--ex-rule)] px-3 py-3 sm:px-5">
        <Link href="/exodus/council" className="grid size-9 place-items-center text-slate-400 hover:text-slate-100 lg:hidden" aria-label="Back to the council">
          <Icon name="arrowLeft" className="size-5" />
        </Link>
        <PersonaSeal name={thread.persona} size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-slate-50">{thread.persona}</h1>
          {thread.personaTitle && <p className="truncate text-xs text-slate-400">{thread.personaTitle}</p>}
        </div>
        {player.isTeacher && (
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden sm:inline">
              <ClanTag clan={clan} href={`/exodus/clans/${clan.slug}`} />
            </span>
            <form action={deleteThread}>
              <input type="hidden" name="id" value={thread.id} />
              <ConfirmButton
                label="Delete"
                confirmLabel="Delete it?"
                className="px-2 py-1 text-xs text-slate-500 hover:text-rose-300"
              />
            </form>
          </div>
        )}
      </header>
      <Conversation
        key={thread.id}
        threadId={thread.id}
        persona={thread.persona}
        side={player.isTeacher ? "teacher" : "leader"}
        messages={messages}
        seal={<PersonaSeal name={thread.persona} />}
        leaderSeal={<ClanLogo clan={clan} className="size-10" />}
      />
    </CouncilFrame>
  );
}
