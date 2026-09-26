import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Card, EmptyState, buttonClass } from "@/components/ui";
import { getPlayer, getScenarios } from "@/lib/exodus/queries";
import { formatDateTime } from "@/lib/format";

export default async function ScenariosPage() {
  const player = await getPlayer();
  const items = await getScenarios(player);

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {player.isTeacher
            ? "Put a situation to the clans. Each leader writes how their clan responds."
            : "Situations your clan faces on the journey. Decide what to do and write your answer."}
        </p>
        {player.isTeacher && (
          <Link href="/exodus/scenarios/new" className={buttonClass}>
            <Icon name="plus" className="size-4" /> New scenario
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState>{player.isTeacher ? "No scenarios yet." : "No scenarios for your clan yet."}</EmptyState>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                href={`/exodus/scenarios/${s.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-night-900/70 p-4 transition hover:border-white/15 hover:bg-night-800/70"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                  <Icon name="scroll" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-snug font-semibold text-slate-50">{s.title}</span>
                  <span className="text-xs text-slate-500">{formatDateTime(s.createdAt)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {player.isTeacher ? (
                    <Badge tone={s.answered === s.sentTo ? "green" : "slate"}>
                      {s.answered}/{s.sentTo} answered
                    </Badge>
                  ) : s.answeredByMe ? (
                    <Badge tone="green">Answered</Badge>
                  ) : s.closed ? (
                    <Badge tone="red">Missed</Badge>
                  ) : (
                    <Badge tone="gold">Needs answer</Badge>
                  )}
                  {s.closed && player.isTeacher && <Badge>Closed</Badge>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
