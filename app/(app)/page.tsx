import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, EmptyState, Stat, TextLink, scoreTone } from "@/components/ui";
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
    <div>
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

      <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
        <LatestAnnouncements items={announcements} />
        <Section title="Latest lesson">
          {latest ? (
            <ContentLink item={latest}>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-100">{latest.title}</span>
                <span className="block text-sm text-slate-500">
                  {latest.kind === "lesson" ? "Lesson" : "Supplementary"}
                </span>
              </span>
              <Icon name={latest.page ? "chevronRight" : "external"} className="size-4 shrink-0 text-slate-500" />
            </ContentLink>
          ) : (
            <EmptyState>Nothing posted yet.</EmptyState>
          )}
        </Section>
        {user.role === "teacher" ? <TeacherHome /> : <StudentHome user={user} />}
      </div>
    </div>
  );
}

/** A titled block of the home page: a heading over a hairline, no box. */
function Section({
  title,
  action,
  className = "",
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-100">{title}</h2>
        {action && <span className="text-sm">{action}</span>}
      </div>
      {children}
    </section>
  );
}

function LatestAnnouncements({ items }: { items: AnnouncementItem[] }) {
  const unread = items.filter((a) => a.unread).length;
  return (
    <Section
      title={
        <>
          Announcements
          {unread > 0 && <Badge tone="gold">{unread} new</Badge>}
        </>
      }
      action={<TextLink href="/announcements">See all</TextLink>}
      className="md:row-span-2"
    >
      {items.length === 0 ? (
        <EmptyState>No announcements yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-faint">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/announcements#a-${a.id}`}
                className="group flex items-start gap-3 py-3"
              >
                <span
                  className={`mt-2 size-2 shrink-0 rounded-full ${
                    a.unread ? "bg-amber-400" : "bg-wash-hover"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate group-hover:text-amber-200 ${a.unread ? "font-semibold text-slate-50" : "font-medium text-slate-200"}`}>
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
    </Section>
  );
}

const contentLinkClass = "flex items-center gap-4 py-3 transition hover:text-amber-200";

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
    <Section title="Recent quiz submissions" action={<TextLink href="/quizzes">Quizzes</TextLink>}>
      {recent.length === 0 ? (
        <EmptyState>No submissions yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-faint text-sm">
          {recent.map((r) => {
            const pct = percent(r.score, r.total);
            return (
              <li key={r.id}>
                <Link href={`/quizzes/${r.quizId}`} className="group flex items-baseline gap-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-slate-200 group-hover:text-amber-200">{r.student}</span>
                    <span className="text-slate-500"> · {r.quiz}</span>
                  </span>
                  <span className={`font-semibold tabular-nums ${SCORE_TEXT[scoreTone(pct)]}`}>{pct}%</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

const SCORE_TEXT = {
  slate: "text-slate-400",
  green: "text-emerald-300",
  amber: "text-orange-300",
  red: "text-rose-300",
} as const;

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
      <Section title="Quizzes to take">
        {todo.length === 0 ? (
          <p className="py-3 text-sm text-slate-500">You&apos;re all caught up.</p>
        ) : (
          <ul className="divide-y divide-line-faint">
            {todo.map((q) => (
              <li key={q.id}>
                <Link href={`/quizzes/${q.id}`} className="flex items-center justify-between gap-3 py-2.5 text-slate-200 hover:text-amber-200">
                  <span className="truncate">{q.title}</span>
                  <Icon name="chevronRight" className="size-4 shrink-0 text-slate-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="My year so far" action={<TextLink href="/grades">Every Sunday</TextLink>}>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Stat label="Attendance" value={summary.attendance} />
          <Stat label="Quiz avg" value={summary.quiz} suffix="" />
          <Stat label="Sermon notes" value={summary.sermonNotes} />
        </div>
      </Section>
      <p className="text-sm text-slate-400 md:col-span-2">
        Have a question? <TextLink href="/questions">Ask it in the question box</TextLink>. It&apos;s
        anonymous: your name is never saved.
      </p>
    </>
  );
}
