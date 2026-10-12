import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { EmptyState, Field, buttonClass, inputClass } from "@/components/ui";
import { adjustResources, setUpGame } from "@/lib/actions/exodus";
import { CLANS, clanInfo, type ClanSlug } from "@/lib/exodus/clans";
import {
  getClan,
  getClans,
  getNews,
  getPlayer,
  getRoleHolders,
  getThreads,
  type Player,
} from "@/lib/exodus/queries";
import { mannaStatus } from "@/lib/exodus/manna";
import { RESOURCES, STARTING_DAYS } from "@/lib/exodus/resources";
import { timeAgo } from "@/lib/format";
import { ClansAndSpeaker } from "./council/speaker-fields";
import { ClanHero, ClanLogo, ResourcePanel, ResourceSummary } from "./game-ui";
import { MannaSupply } from "./manna";
import { ThreadList } from "./council/council-ui";
import { Divider, Glyph, GlyphSeal, Panel, type GlyphName } from "./ornaments";

export default async function ExodusPage() {
  const player = await getPlayer();
  if (player.isTeacher) return <TeacherCamp />;
  if (!player.clan) {
    return (
      <Panel>
        <EmptyState>
          You haven&apos;t been given a clan yet. Ask your teacher to make you a clan leader.
        </EmptyState>
      </Panel>
    );
  }
  return <LeaderCamp player={player} slug={player.clan} />;
}

async function TeacherCamp() {
  const [clans, holders] = await Promise.all([getClans(), getRoleHolders()]);

  if (clans.length < CLANS.length) {
    const missing = CLANS.length - clans.length;
    return (
      <Panel className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold text-slate-50">
          {clans.length === 0 ? "Start the journey" : "Some clans are missing"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {`This creates ${missing === CLANS.length ? "the six clans" : `the ${missing} missing clans`} with their people (everyone starts as a Villager) and ${STARTING_DAYS} days of water. Food is manna: each clan's leader gathers it once a day. Students whose first name matches a clan (Caleb, Jennifer, Jessica, Keren, Riya, Noah) become its leader; you can change leaders on each clan's page.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          {CLANS.map((c) => (
            <ClanLogo key={c.slug} clan={c} className="size-12" />
          ))}
        </div>
        <form action={setUpGame} className="mt-6">
          <button className={buttonClass}>Found the clans</button>
        </form>
      </Panel>
    );
  }

  const total = clans.reduce((sum, c) => sum + c.people, 0);
  const manna = new Map(clans.map((c) => [c.slug, mannaStatus(c.fedThrough, c.people)]));
  const fed = [...manna.values()].filter((m) => m.fed).length;

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-3 border-y border-[var(--ex-rule)] py-3 text-center sm:max-w-xl">
        {[
          { label: "People in the camp", value: total.toLocaleString() },
          { label: "Clans", value: clans.length },
          { label: "Gathered manna today", value: `${fed} of ${clans.length}` },
        ].map((s) => (
          <div key={s.label} className="flex flex-col-reverse border-line-subtle not-first:border-l">
            <dt className="mt-0.5 px-1 text-[11px] tracking-[0.14em] text-slate-500 uppercase">{s.label}</dt>
            <dd className="font-display text-2xl font-semibold text-slate-50 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {clans.map((row) => {
          const clan = clanInfo(row.slug);
          return (
            <Link
              key={row.slug}
              href={`/exodus/clans/${row.slug}`}
              className="ex-panel group block overflow-hidden transition hover:border-[var(--ex-gold-soft)]"
            >
              <div className={`pointer-events-none absolute -top-16 -left-10 size-40 rounded-full blur-3xl ${clan.accent.glow}`} />
              <div className="relative p-4 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <ClanLogo clan={clan} className="size-14" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl font-semibold text-slate-50">{clan.name}</h2>
                    <p className="text-sm text-slate-400">
                      {row.leaderName ?? <span className="text-orange-300">No leader</span>} ·{" "}
                      {row.people.toLocaleString()} people
                    </p>
                  </div>
                  <Icon name="chevronRight" className="size-5 text-slate-600 transition group-hover:text-[var(--ex-gold)]" />
                </div>
                <div className="mt-4">
                  <ResourceSummary resources={row.resources} people={row.people} manna={manna.get(row.slug)!} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Panel title="Give or take supplies" className="max-w-4xl">
        <p className="-mt-1 mb-5 text-sm text-slate-400">
          Enter how much to add (or a minus sign to take away) and leave the rest blank. Whoever delivers it tells
          each clan in the council; the Scribe also records every change.
        </p>
        <ActionForm action={adjustResources} submitLabel="Apply changes" resetOnSuccess>
          <ClansAndSpeaker
            holders={holders}
            legend="Who delivers it"
            initialClans={CLANS.map((c) => c.slug)}
            withScribe
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {RESOURCES.map((r) => (
              <div key={r.key} className="space-y-1.5">
                <label htmlFor={`d_${r.key}`} className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
                  <Glyph name={r.key as GlyphName} className="size-4 text-[var(--ex-gold)]" />
                  {r.label}
                </label>
                <input
                  id={`d_${r.key}`}
                  name={`d_${r.key}`}
                  inputMode="numeric"
                  pattern="-?[0-9]*"
                  placeholder="+0"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          <Field label="What they say" htmlFor="reason">
            <textarea
              id="reason"
              name="reason"
              rows={3}
              placeholder="e.g. At evening quail came up and covered the camp (Exodus 16:13). The Lord has given you meat."
              className={`${inputClass} leading-6`}
            />
            <p className="text-xs text-slate-500">
              Optional for the Scribe. The clan sees the changes as a ledger above these words.
            </p>
          </Field>
        </ActionForm>
      </Panel>
    </div>
  );
}

async function LeaderCamp({ player, slug }: { player: Player; slug: ClanSlug }) {
  const [row, threads, news] = await Promise.all([getClan(player, slug), getThreads(player, { limit: 4 }), getNews(2)]);
  const clan = clanInfo(row.slug);
  const waiting = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <div className="space-y-7">
      <ClanHero clan={clan} leader={row.leaderName} people={row.people}>
        <Link href={`/exodus/clans/${row.slug}`} className={buttonClass}>
          My people <Icon name="chevronRight" className="size-4" />
        </Link>
      </ClanHero>

      <Panel
        title={waiting > 0 ? `At your tent · ${waiting} waiting` : "At your tent"}
        action={
          <Link href="/exodus/council" className="text-[var(--ex-gold)] hover:underline">
            Council →
          </Link>
        }
      >
        <div className="-mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
          <ThreadList threads={threads} emptyText="No one has come to your tent yet." />
        </div>
      </Panel>

      <Panel title="The scribe's tally" id="supplies">
        <MannaSupply slug={row.slug} status={mannaStatus(row.fedThrough, row.people)} people={row.people} as="leader" />
        <ResourcePanel resources={row.resources} people={row.people} />
      </Panel>

      <Divider />

      <div>
        <Panel title="Camp news">
          {news.length === 0 ? (
            <EmptyState>No news yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-line-faint">
              {news.map((n) => (
                <li key={n.id}>
                  <Link href={`/exodus/news/${n.id}`} className="group flex items-center gap-3 py-2.5">
                    <GlyphSeal name="shofar" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold text-slate-50 group-hover:text-[var(--ex-gold)]">
                        {n.title}
                      </span>
                      <span className="text-xs text-slate-500">{timeAgo(n.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
