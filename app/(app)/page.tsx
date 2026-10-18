import { eq } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, EmptyState, Stat, TextLink } from "@/components/ui";
import { CONTENT, contentHref, type ContentItem } from "@/lib/content";
import { requireUser, type CurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getCouncilUnread, getPlayer, getThreads } from "@/lib/exodus/queries";
import { formatTime, plainText, timeAgo, today } from "@/lib/format";
import {
  getAnnouncements,
  getEvents,
  getPublishedQuizzes,
  getWeeklyGrades,
  type AnnouncementItem,
} from "@/lib/queries";
import { currentSunday, summarize } from "@/lib/school-year";
import { getMemoryVerse } from "@/lib/verses";
import { TONES, eventTone } from "./calendar/event-tone";
import { ThreadList } from "./exodus/council/council-ui";

export default async function HomePage() {
  const user = await requireUser();
  const [latest] = CONTENT;
  const announcements = await getAnnouncements(user, 3);
  const verse = await getMemoryVerse(currentSunday(today()));

  return (
    <div>
      {/*
        The welcome and this week's verse, open on the page (the sections below
        are the panels), with the cross in its own column, centred beside the words.
      */}
      <section className="relative flex items-center gap-4 sm:gap-8">
        <div className="pointer-events-none absolute -top-28 -right-10 size-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative min-w-0 flex-1">
          <p className="relative font-display text-xs font-semibold tracking-[0.25em] text-[var(--ex-gold)] uppercase">
            Welcome, {user.name.split(" ")[0]}
          </p>
          {verse && (
            <>
              <blockquote className="relative mt-4 max-w-5xl">
                <p className="font-display text-2xl leading-snug font-medium text-balance text-slate-50 sm:text-3xl lg:text-4xl">
                  “{verse.text}”
                </p>
                <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xs font-semibold tracking-[0.18em] text-[var(--ex-gold)] uppercase">
                  <span className="h-px w-8 bg-[var(--ex-gold-soft)]" aria-hidden />
                  <span className="whitespace-nowrap">{verse.reference}</span>
                  <span className="whitespace-nowrap text-slate-500">· Memory verse</span>
                </footer>
              </blockquote>
              <Link
                href="/memory-verse"
                className="relative mt-6 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-amber-300/25 bg-amber-400/10 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
              >
                Practice it
                <Icon name="chevronRight" className="size-4" />
              </Link>
            </>
          )}
        </div>
        <Icon
          name="cross"
          className="pointer-events-none relative size-20 shrink-0 text-amber-200/[0.1] sm:size-36 lg:size-52"
        />
      </section>
      <div className="ex-bells mt-8" aria-hidden />

      {user.role === "student" && <ExodusToday />}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
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

/** A titled block of the home page, in The Exodus's panel with a gold small-caps heading. */
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
    <section className={`ex-panel p-4 sm:p-5 ${className}`}>
      <div className="mb-1 flex items-center gap-3">
        <h2 className="ex-heading min-w-0 flex-1">{title}</h2>
        {action && <span className="shrink-0 text-sm">{action}</span>}
      </div>
      {children}
    </section>
  );
}

/** Who is waiting at a clan leader's tent (the baker comes each morning about the manna), so no one is missed. */
async function ExodusToday() {
  const player = await getPlayer();
  if (!player.clan) return null;
  const [threads, unread] = await Promise.all([getThreads(player, { limit: 3 }), getCouncilUnread(player)]);

  return (
    <Section
      className="mt-6"
      title={
        <>
          At your tent
          {unread > 0 && <Badge tone="gold">{unread} new</Badge>}
        </>
      }
      action={<TextLink href="/exodus/council">Council</TextLink>}
    >
      <ThreadList threads={threads} emptyText="No one has come to your tent yet." />
    </Section>
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
      className="md:row-span-2 md:self-start"
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

/** What's coming on the calendar, so teachers can plan ahead at a glance. */
async function TeacherHome() {
  const upcoming = await getEvents("teacher", today(), "9999-12-31").limit(5);
  const now = today();

  return (
    <Section title="Next up" action={<TextLink href="/calendar">Calendar</TextLink>}>
      {upcoming.length === 0 ? (
        <EmptyState>Nothing on the calendar yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-faint">
          {upcoming.map((e) => {
            const tone = TONES[eventTone(e)];
            const day = new Date(`${e.date}T00:00:00Z`);
            return (
              <li key={e.id}>
                <Link href={`/calendar?month=${e.date.slice(0, 7)}`} className="group flex items-center gap-4 py-3">
                  {/* A small page torn from a calendar. */}
                  <span className="grid w-12 shrink-0 border border-[var(--ex-rule)] text-center">
                    <span className="bg-amber-400/10 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[var(--ex-gold)] uppercase">
                      {day.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" })}
                    </span>
                    <span className="py-1 font-display text-xl leading-none font-semibold text-slate-50">
                      {day.getUTCDate()}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-100 group-hover:text-amber-200">{e.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <span className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} />
                      {day.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" })} ·{" "}
                      {e.startTime ? formatTime(e.startTime) : "All day"}
                      {eventTone(e) !== "all" && <span className={tone.text}>· {tone.label}</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">{daysAway(e.date, now)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

/** "Today", "Tomorrow", or "In 5 days" from one YYYY-MM-DD date to another. */
function daysAway(date: string, from: string) {
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
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
