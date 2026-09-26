import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Markdown } from "@/components/markdown";
import { Badge, Card, inputClass, secondaryButtonClass } from "@/components/ui";
import { answerScenario, deleteScenario, toggleScenarioClosed } from "@/lib/actions/exodus";
import { CLANS, clanInfo } from "@/lib/exodus/clans";
import { getPlayer, getScenario } from "@/lib/exodus/queries";
import { formatDateTime, timeAgo } from "@/lib/format";
import { BackLink, ClanTag } from "../../game-ui";

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const player = await getPlayer();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { scenario, recipients } = await getScenario(player, id);
  const mine = player.isTeacher ? undefined : recipients[0];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <BackLink href="/exodus/scenarios">Scenarios</BackLink>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-300/80 uppercase">Scenario</p>
          {scenario.closed && <Badge tone="red">Closed</Badge>}
        </div>
        <h1 className="mt-1 font-display text-3xl font-semibold text-balance text-slate-50 sm:text-4xl">
          {scenario.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Sent {formatDateTime(scenario.createdAt)}</p>
      </div>

      <Card>
        <Markdown compact>{scenario.prompt}</Markdown>
      </Card>

      {mine && (
        <Card title="Your clan's answer">
          {scenario.closed ? (
            mine.response ? (
              <p className="whitespace-pre-line text-slate-200">{mine.response}</p>
            ) : (
              <p className="text-sm text-slate-400">This scenario closed before your clan answered.</p>
            )
          ) : (
            <ActionForm
              action={answerScenario}
              submitLabel={mine.response ? "Update answer" : "Send answer"}
              pendingLabel="Sending…"
            >
              <input type="hidden" name="id" value={scenario.id} />
              <textarea
                name="response"
                required
                rows={7}
                aria-label="Your answer"
                defaultValue={mine.response ?? ""}
                placeholder="What will your clan do, and why?"
                className={`${inputClass} leading-6`}
              />
              {mine.respondedAt && (
                <p className="text-xs text-slate-500">
                  Last sent {timeAgo(mine.respondedAt)}. You can change it until the scenario closes.
                </p>
              )}
            </ActionForm>
          )}
        </Card>
      )}

      {player.isTeacher && (
        <>
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-100">
              Answers{" "}
              <span className="font-normal text-slate-500">
                {recipients.filter((r) => r.respondedAt).length} of {recipients.length}
              </span>
            </h2>
            {CLANS.filter((c) => recipients.some((r) => r.clanSlug === c.slug)).map((c) => {
              const r = recipients.find((x) => x.clanSlug === c.slug)!;
              return (
                <Card key={c.slug}>
                  <div id={c.slug} className="flex scroll-mt-28 flex-wrap items-center justify-between gap-2">
                    <ClanTag clan={clanInfo(c.slug)} href={`/exodus/clans/${c.slug}`} />
                    {r.respondedAt ? (
                      <span className="text-xs text-slate-500" title={formatDateTime(r.respondedAt)}>
                        {timeAgo(r.respondedAt)}
                      </span>
                    ) : (
                      <Badge>Waiting</Badge>
                    )}
                  </div>
                  {r.response && <p className="mt-3 whitespace-pre-line text-slate-200">{r.response}</p>}
                </Card>
              );
            })}
          </section>

          <div className="flex flex-wrap gap-3">
            <form action={toggleScenarioClosed}>
              <input type="hidden" name="id" value={scenario.id} />
              <button className={secondaryButtonClass}>
                {scenario.closed ? "Reopen for answers" : "Close answers"}
              </button>
            </form>
            <form action={deleteScenario}>
              <input type="hidden" name="id" value={scenario.id} />
              <ConfirmButton label="Delete scenario" confirmLabel="Delete it and all answers?" />
            </form>
          </div>
        </>
      )}
    </div>
  );
}
