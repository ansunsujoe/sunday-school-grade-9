import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import type { CalendarEvent } from "@/lib/db/schema";
import { formatMonth, formatTime, today } from "@/lib/format";
import { getEvents } from "@/lib/queries";
import { TONES, eventTone, type Tone } from "./event-tone";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 3;

/** Adds `days` to a YYYY-MM-DD date string. */
function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Shifts a YYYY-MM month string by `months`. */
function addMonths(month: string, months: number) {
  const d = new Date(`${month}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 7);
}

/** Every day shown on the month grid: whole weeks, Sunday through Saturday. */
function gridDays(month: string) {
  const first = `${month}-01`;
  const start = addDays(first, -new Date(`${first}T00:00:00Z`).getUTCDay());
  const last = addDays(`${addMonths(month, 1)}-01`, -1);
  const end = addDays(last, 6 - new Date(`${last}T00:00:00Z`).getUTCDay());
  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

function timeRange(event: CalendarEvent) {
  if (!event.startTime) return "All day";
  const start = formatTime(event.startTime);
  return event.endTime ? `${start} – ${formatTime(event.endTime)}` : start;
}

const monthHref = (month: string) => `/calendar?month=${month}`;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const isTeacher = user.role === "teacher";
  const now = today();
  const thisMonth = now.slice(0, 7);
  const { month: param } = await searchParams;
  const month = typeof param === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(param) ? param : thisMonth;

  const days = gridDays(month);
  const [monthEvents, upcoming] = await Promise.all([
    getEvents(user.role, days[0], days.at(-1)!),
    getEvents(user.role, now, "9999-12-31").limit(3),
  ]);

  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of monthEvents) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  const inMonth = monthEvents.filter((e) => e.date.startsWith(month));
  const tones: Tone[] = isTeacher ? ["all", "teachers", "closed"] : ["all", "closed"];

  return (
    <>
      <PageHeader
        eyebrow="2026 – 2027 school year"
        title="Calendar"
        action={
          isTeacher && (
            <Link href="/calendar/new" className={buttonClass}>
              <Icon name="plus" className="size-4" /> Add event
            </Link>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="overflow-hidden rounded-2xl border border-line bg-night-900/70 shadow-xl shadow-black/20 backdrop-blur-sm">
          {/* Month switcher and legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <MonthArrow href={monthHref(addMonths(month, -1))} label="Previous month" icon="chevronLeft" />
              <h2 className="min-w-44 text-center font-display text-xl font-semibold text-slate-50 sm:text-2xl">
                {formatMonth(`${month}-01`)}
              </h2>
              <MonthArrow href={monthHref(addMonths(month, 1))} label="Next month" icon="chevronRight" />
              {month !== thisMonth && (
                <Link
                  href="/calendar"
                  className="ml-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/20"
                >
                  Today
                </Link>
              )}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
              {tones.map((tone) => (
                <li key={tone} className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${TONES[tone].dot}`} />
                  {TONES[tone].label}
                </li>
              ))}
            </ul>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 border-b border-line-subtle text-center text-[11px] font-semibold tracking-[0.15em] uppercase">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`py-2 ${i === 0 ? "text-amber-300/90" : "text-slate-500"}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <DayCell
                key={day}
                day={day}
                events={byDay.get(day) ?? []}
                outside={!day.startsWith(month)}
                isToday={day === now}
                isPast={day < now}
                isSunday={i % 7 === 0}
                isTeacher={isTeacher}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <Card title="Up next">
            {upcoming.length === 0 ? (
              <EmptyState>Nothing coming up.</EmptyState>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <EventRow event={e} isTeacher={isTeacher} showDate />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`In ${formatMonth(`${month}-01`).split(" ")[0]}`}>
            {inMonth.length === 0 ? (
              <EmptyState>No events this month.</EmptyState>
            ) : (
              <ol className="space-y-4">
                {[...new Set(inMonth.map((e) => e.date))].map((date) => (
                  <li
                    key={date}
                    id={`day-${date}`}
                    className={`flex scroll-mt-24 gap-3 ${date < now ? "opacity-55" : ""}`}
                  >
                    <DateTile date={date} isToday={date === now} />
                    <ul className="min-w-0 flex-1 space-y-2">
                      {byDay.get(date)!.map((e) => (
                        <li key={e.id}>
                          <EventRow event={e} isTeacher={isTeacher} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}

function MonthArrow({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: "chevronLeft" | "chevronRight";
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-wash text-slate-300 transition hover:bg-wash-hover hover:text-slate-50 active:scale-95"
    >
      <Icon name={icon} />
    </Link>
  );
}

function DayCell({
  day,
  events,
  outside,
  isToday,
  isPast,
  isSunday,
  isTeacher,
}: {
  day: string;
  events: CalendarEvent[];
  outside: boolean;
  isToday: boolean;
  isPast: boolean;
  isSunday: boolean;
  isTeacher: boolean;
}) {
  const closed = events.some((e) => e.noSundaySchool);
  const extra = events.length - MAX_CHIPS;

  return (
    <div
      className={`group relative min-h-14 border-r border-b border-line-faint p-1 nth-[7n]:border-r-0 md:min-h-30 md:p-1.5 ${
        closed
          ? "bg-[repeating-linear-gradient(135deg,rgb(251_113_133/0.07)_0_6px,transparent_6px_12px)]"
          : isSunday
            ? "bg-amber-300/[0.025]"
            : ""
      } ${outside ? "opacity-35" : ""}`}
    >
      {/* On phones the whole cell jumps to that day in the list below. */}
      {events.length > 0 && (
        <a href={`#day-${day}`} className="absolute inset-0 md:hidden" aria-label={`Events on ${day}`} />
      )}

      <div className="flex items-center justify-between">
        <span
          className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
            isToday
              ? "bg-amber-400 text-ink shadow-lg shadow-amber-400/30"
              : isPast
                ? "text-slate-500"
                : "text-slate-200"
          }`}
        >
          {Number(day.slice(8))}
        </span>
        {isTeacher && (
          <Link
            href={`/calendar/new?date=${day}`}
            aria-label={`Add event on ${day}`}
            className="hidden size-6 place-items-center rounded-md text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-wash-hover hover:text-amber-200 md:grid"
          >
            <Icon name="plus" className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Phones: colored dots */}
      <div className="mt-1 flex flex-wrap justify-center gap-1 md:hidden">
        {events.slice(0, 4).map((e) => (
          <span key={e.id} className={`size-1.5 rounded-full ${TONES[eventTone(e)].dot}`} />
        ))}
      </div>

      {/* Tablets and up: event chips */}
      <ul className="mt-1 hidden space-y-1 md:block">
        {events.slice(0, MAX_CHIPS).map((e) => {
          const tone = TONES[eventTone(e)];
          const chip = (
            <>
              <span className="block truncate font-medium">{e.title}</span>
              {e.startTime && (
                <span className="block truncate text-[10px] opacity-65">{formatTime(e.startTime)}</span>
              )}
            </>
          );
          const chipClass = `block rounded-md border-l-2 px-1.5 py-0.5 text-[11px] leading-4 ring-1 ring-inset transition ${tone.chip}`;
          return (
            <li key={e.id} title={`${e.title} · ${timeRange(e)}`}>
              {isTeacher ? (
                <Link href={`/calendar/${e.id}/edit`} className={chipClass}>
                  {chip}
                </Link>
              ) : (
                <span className={chipClass}>{chip}</span>
              )}
            </li>
          );
        })}
        {extra > 0 && (
          <li>
            <a href={`#day-${day}`} className="px-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-100">
              +{extra} more
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

function DateTile({ date, isToday }: { date: string; isToday: boolean }) {
  const d = new Date(`${date}T00:00:00Z`);
  return (
    <div
      className={`flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5 ring-1 ${
        isToday ? "bg-amber-400/15 ring-amber-400/40" : "bg-wash ring-line"
      }`}
    >
      <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
        {d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" })}
      </span>
      <span className={`font-display text-xl leading-6 font-semibold ${isToday ? "text-amber-200" : "text-slate-100"}`}>
        {d.getUTCDate()}
      </span>
    </div>
  );
}

function EventRow({
  event,
  isTeacher,
  showDate = false,
}: {
  event: CalendarEvent;
  isTeacher: boolean;
  showDate?: boolean;
}) {
  const toneKey = eventTone(event);
  const tone = TONES[toneKey];
  const when = showDate
    ? `${new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: "short",
        month: "short",
        day: "numeric",
      })} · ${timeRange(event)}`
    : timeRange(event);

  const body = (
    <>
      <span className={`w-1 shrink-0 self-stretch rounded-full ${tone.bar}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-100">{event.title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          <Icon name="clock" className="size-3.5 shrink-0" />
          {when}
        </span>
        {toneKey !== "all" && (
          <span className={`mt-1 block text-[11px] font-semibold tracking-wider uppercase ${tone.text}`}>
            {tone.label}
          </span>
        )}
      </span>
    </>
  );

  const rowClass = "flex gap-3 rounded-xl border border-line-subtle bg-wash p-2.5";
  return isTeacher ? (
    <Link href={`/calendar/${event.id}/edit`} className={`${rowClass} transition hover:border-line-strong hover:bg-wash-hover`}>
      {body}
    </Link>
  ) : (
    <div className={rowClass}>{body}</div>
  );
}
