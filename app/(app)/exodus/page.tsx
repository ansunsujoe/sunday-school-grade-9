import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { Card, EmptyState, Field, buttonClass, inputClass } from "@/components/ui";
import { adjustResources, setUpGame } from "@/lib/actions/exodus";
import { CLANS, clanInfo, type ClanSlug } from "@/lib/exodus/clans";
import {
  getClan,
  getClans,
  getNews,
  getNotifications,
  getPlayer,
  getScenarios,
  type Player,
} from "@/lib/exodus/queries";
import { RESOURCES, STARTING_DAYS } from "@/lib/exodus/resources";
import { timeAgo } from "@/lib/format";
import { ClanPicker } from "./clan-picker";
import { ClanHero, ClanLogo, ResourcePanel, ResourceSummary } from "./game-ui";
import { NotificationList } from "./notifications/notification-list";

export default async function ExodusPage() {
  const player = await getPlayer();
  if (player.isTeacher) return <TeacherCamp />;
  if (!player.clan) {
    return (
      <Card>
        <EmptyState>
          You haven&apos;t been given a clan yet. Ask your teacher to make you a clan leader.
        </EmptyState>
      </Card>
    );
  }
  return <LeaderCamp player={player} slug={player.clan} />;
}

async function TeacherCamp() {
  const clans = await getClans();

  if (clans.length < CLANS.length) {
    const missing = CLANS.length - clans.length;
    return (
      <Card className="max-w-2xl">
        <h2 className="font-display text-2xl font-semibold text-slate-50">
          {clans.length === 0 ? "Start the journey" : "Some clans are missing"}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {`This creates ${missing === CLANS.length ? "the six clans" : `the ${missing} missing clans`} with their people (everyone starts as a Villager) and ${STARTING_DAYS} days of food and water. Students whose first name matches a clan (Caleb, Jennifer, Jessica, Keren, Riya, Noah) become its leader; you can change leaders on each clan's page.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {CLANS.map((c) => (
            <ClanLogo key={c.slug} clan={c} className="size-12" />
          ))}
        </div>
        <form action={setUpGame} className="mt-6">
          <button className={buttonClass}>Found the clans</button>
        </form>
      </Card>
    );
  }

  const total = clans.reduce((sum, c) => sum + c.people, 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        {total.toLocaleString()} people in {clans.length} clans. Open a clan to see its people or change its leader.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clans.map((row) => {
          const clan = clanInfo(row.slug);
          return (
            <Link
              key={row.slug}
              href={`/exodus/clans/${row.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-night-900/70 p-4 shadow-xl shadow-black/20 transition hover:border-white/15 hover:bg-night-800/70 sm:p-5"
            >
              <div className={`pointer-events-none absolute -top-16 -left-10 size-40 rounded-full blur-3xl ${clan.accent.glow}`} />
              <div className="relative flex items-center gap-3.5">
                <ClanLogo clan={clan} className="size-16" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold text-slate-50">{clan.name}</h2>
                  <p className="text-sm text-slate-400">
                    {row.leaderName ?? <span className="text-orange-300">No leader</span>} ·{" "}
                    {row.people.toLocaleString()} people
                  </p>
                </div>
                <Icon name="chevronRight" className="size-5 text-slate-600 transition group-hover:text-slate-300" />
              </div>
              <div className="relative mt-4">
                <ResourceSummary resources={row.resources} people={row.people} />
              </div>
            </Link>
          );
        })}
      </div>

      <Card title="Give or take supplies" className="max-w-4xl">
        <p className="-mt-2 mb-4 text-sm text-slate-400">
          Enter how much to add (or a minus sign to take away) and leave the rest blank. Each clan gets a
          notification with your reason.
        </p>
        <ActionForm action={adjustResources} submitLabel="Apply changes" resetOnSuccess>
          <ClanPicker clans={CLANS} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {RESOURCES.map((r) => (
              <Field key={r.key} label={`${r.emoji} ${r.label}`} htmlFor={`d_${r.key}`}>
                <input
                  id={`d_${r.key}`}
                  name={`d_${r.key}`}
                  inputMode="numeric"
                  pattern="-?[0-9]*"
                  placeholder="+0"
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
          <Field label="Reason" htmlFor="reason">
            <input
              id="reason"
              name="reason"
              placeholder="e.g. Quail covered the camp in the evening (Exodus 16:13)"
              className={inputClass}
            />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}

async function LeaderCamp({ player, slug }: { player: Player; slug: ClanSlug }) {
  const [row, scenarios, news, notifications] = await Promise.all([
    getClan(player, slug),
    getScenarios(player),
    getNews(2),
    getNotifications(player, 5),
  ]);
  const clan = clanInfo(row.slug);
  const waiting = scenarios.filter((s) => !s.closed && !s.answeredByMe);

  return (
    <div className="space-y-6">
      <ClanHero clan={clan} leader={row.leaderName} people={row.people}>
        <Link href={`/exodus/clans/${row.slug}`} className={buttonClass}>
          My people <Icon name="chevronRight" className="size-4" />
        </Link>
      </ClanHero>

      {waiting.length > 0 && (
        <section className="rounded-2xl border border-amber-400/35 bg-linear-to-br from-amber-400/[0.08] to-night-900/80 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-amber-100">
            <Icon name="scroll" className="size-5 text-amber-300" />
            {waiting.length === 1 ? "A scenario needs your answer" : `${waiting.length} scenarios need your answer`}
          </h2>
          <ul className="mt-3 space-y-2">
            {waiting.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/exodus/scenarios/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-night-950/40 px-3.5 py-3 transition hover:bg-night-950/70"
                >
                  <span className="font-medium text-slate-50">{s.title}</span>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(s.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card title="Supplies">
        <ResourcePanel resources={row.resources} people={row.people} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Camp news">
          {news.length === 0 ? (
            <EmptyState>No news yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-white/5">
              {news.map((n) => (
                <li key={n.id}>
                  <Link href={`/exodus/news/${n.id}`} className="block py-3 hover:text-amber-100">
                    <span className="block font-display text-lg font-semibold text-slate-50">{n.title}</span>
                    <span className="text-xs text-slate-500">{timeAgo(n.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Latest notifications">
          <NotificationList items={notifications} compact />
          <Link
            href="/exodus/notifications"
            className="mt-3 inline-block text-sm font-medium text-amber-300 hover:text-amber-200"
          >
            All notifications →
          </Link>
        </Card>
      </div>
    </div>
  );
}
