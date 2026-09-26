import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, Card, EmptyState, Stat, TextLink, scoreTone } from "@/components/ui";
import { CONTENT, contentHref, type ContentItem } from "@/lib/content";
import { requireUser, type CurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { quizzes, submissions, users } from "@/lib/db/schema";
import { percent, plainText, timeAgo, today } from "@/lib/format";
import {
  getAnnouncements,
  getPublishedQuizzes,
  getWeeklyGrades,
  type AnnouncementItem,
} from "@/lib/queries";
import { currentSunday, summarize } from "@/lib/school-year";
import { verseForWeek } from "@/lib/verses";

export default async function HomePage() {
  const user = await requireUser();
  const [latest] = CONTENT;
  const announcements = await getAnnouncements(user, 3);
  const verse = verseForWeek(currentSunday(today()));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-amber-300/15 bg-linear-to-br from-night-800 via-night-900 to-night-950 p-5 shadow-2xl shadow-black/30 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-amber-400/15 blur-3xl" />
        <Icon
          name="cross"
          className="pointer-events-none absolute -right-6 -bottom-10 size-56 text-amber-200/[0.05] sm:right-6"
        />
        <p className="relative text-xs font-semibold tracking-[0.2em] text-amber-300/80 uppercase">
          Welcome, {user.name.split(" ")[0]}
        </p>
        <blockquote className="relative mt-4 max-w-5xl">
          <p className="font-display text-2xl leading-snug font-medium text-balance text-slate-50 sm:text-3xl">
            “{verse.text}”
          </p>
          <footer className="mt-3 text-sm font-medium text-amber-200/90">
            {verse.ref} <span className="text-slate-500">· Verse of the week</span>
          </footer>
        </blockquote>
      </section>

      <LatestAnnouncements items={announcements} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Latest in Content">
          {latest ? (
            <ContentLink item={latest}>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                <Icon name={latest.kind === "lesson" ? "book" : "sparkle"} className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg font-semibold text-slate-50">
                  {latest.title}
                </span>
                <span className="block text-sm text-slate-400">
                  {latest.kind === "lesson" ? "Lesson" : "Supplementary"}
                </span>
              </span>
              <Icon name={latest.page ? "chevronRight" : "external"} className="size-4 shrink-0 text-slate-500" />
            </ContentLink>
          ) : (
            <EmptyState>Nothing posted yet.</EmptyState>
          )}
        </Card>
        {user.role === "teacher" ? <TeacherHome /> : <StudentHome user={user} />}
      </div>
    </div>
  );
}

function LatestAnnouncements({ items }: { items: AnnouncementItem[] }) {
  const unread = items.filter((a) => a.unread).length;
  return (
    <Card
      title={
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            Announcements
            {unread > 0 && <Badge tone="gold">{unread} new</Badge>}
          </span>
          <TextLink href="/announcements">See all →</TextLink>
        </span>
      }
    >
      {items.length === 0 ? (
        <EmptyState>No announcements yet.</EmptyState>
      ) : (
        <ul className="-mx-2 divide-y divide-white/5">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/announcements#a-${a.id}`}
                className="flex items-start gap-3 rounded-xl px-2 py-3 transition hover:bg-white/5"
              >
                <span
                  className={`mt-2 size-2 shrink-0 rounded-full ${
                    a.unread ? "bg-amber-400 shadow-[0_0_8px] shadow-amber-400/70" : "bg-white/10"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate ${a.unread ? "font-semibold text-slate-50" : "font-medium text-slate-200"}`}>
                      {a.title}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{timeAgo(a.createdAt)}</span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-sm text-slate-400">{plainText(a.body)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const contentLinkClass = "-m-2 flex items-center gap-4 rounded-xl p-2 transition hover:bg-white/5";

/** Link-only content opens the material directly; pages open on the site. */
function ContentLink({ item, children }: { item: ContentItem; children: React.ReactNode }) {
  if (!item.page) {
    return (
      <a href={contentHref(item)} target="_blank" rel="noopener noreferrer" className={contentLinkClass}>
        {children}
      </a>
    );
  }
  return (
    <Link href={contentHref(item)} className={contentLinkClass}>
      {children}
    </Link>
  );
}

async function TeacherHome() {
  const recent = await db
    .select({
      id: submissions.id,
      score: submissions.score,
      total: submissions.total,
      student: users.name,
      quizId: quizzes.id,
      quiz: quizzes.title,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.studentId, users.id))
    .innerJoin(quizzes, eq(submissions.quizId, quizzes.id))
    .orderBy(desc(submissions.submittedAt))
    .limit(8);

  return (
    <Card title="Recent quiz submissions">
      {recent.length === 0 ? (
        <EmptyState>No submissions yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-white/5 text-sm">
          {recent.map((r) => {
            const pct = percent(r.score, r.total);
            return (
              <li key={r.id} className="flex items-center justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  {r.student} · <TextLink href={`/quizzes/${r.quizId}`}>{r.quiz}</TextLink>
                </span>
                <Badge tone={scoreTone(pct)}>{pct}%</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

async function StudentHome({ user }: { user: CurrentUser }) {
  const [quizList, mine, grades] = await Promise.all([
    getPublishedQuizzes(),
    db.select({ quizId: submissions.quizId }).from(submissions).where(eq(submissions.studentId, user.id)),
    getWeeklyGrades(user.id),
  ]);
  const taken = new Set(mine.map((s) => s.quizId));
  const todo = quizList.filter((q) => !taken.has(q.id));
  const summary = summarize(grades);

  return (
    <>
      <Card title="Quizzes to take">
        {todo.length === 0 ? (
          <EmptyState>You&apos;re all caught up! 🙌</EmptyState>
        ) : (
          <ul className="space-y-2">
            {todo.map((q) => (
              <li key={q.id}>
                <TextLink href={`/quizzes/${q.id}`}>{q.title} →</TextLink>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="My year at a glance" className="md:col-span-2">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Attendance" value={summary.attendance} />
          <Stat label="Quiz avg" value={summary.quiz} suffix="" />
          <Stat label="Sermon notes" value={summary.sermonNotes} />
        </div>
        <p className="mt-4 text-center text-sm">
          <TextLink href="/grades">See every Sunday →</TextLink>
        </p>
      </Card>
      <Card title="Have a question?" className="md:col-span-2">
        <Link
          href="/questions"
          className="-m-2 flex items-center gap-4 rounded-xl p-2 transition hover:bg-white/5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
            <Icon name="question" className="size-6" />
          </span>
          <span className="min-w-0 flex-1 text-sm text-slate-300">
            Ask your teachers anything in the question box. It&apos;s anonymous: your name is never
            saved.
          </span>
          <Icon name="chevronRight" className="size-4 shrink-0 text-slate-500" />
        </Link>
      </Card>
    </>
  );
}
