import Link from "next/link";
import { formatShortDate } from "@/lib/format";
import { SUNDAYS, type WeeklyGrade } from "@/lib/school-year";

/**
 * Every Sunday of the school year as a row of gold diamonds: weeks gone by
 * filled in, this week ringed, the week on screen lit. Each one opens that week.
 */
export function YearTrack({ date, thisWeek }: { date: string; thisWeek: string }) {
  const n = SUNDAYS.length;
  // Month names under each month's first Sunday, skipping one that would sit on top
  // of the last (the year can start on the last Sunday of a month).
  const months: { i: number; label: string }[] = [];
  SUNDAYS.forEach((s, i) => {
    const starts = i === 0 || s.slice(0, 7) !== SUNDAYS[i - 1].slice(0, 7);
    if (!starts) return;
    const last = months.at(-1);
    if (last && i - last.i < 3) months.pop();
    months.push({ i, label: formatShortDate(s).split(" ")[0] });
  });
  return (
    <nav aria-label="Sundays this school year" className="mb-6">
      <div className="flex items-center">
        {SUNDAYS.map((s, i) => {
          const selected = s === date;
          const now = s === thisWeek;
          const past = s < thisWeek;
          return (
            <Link
              key={s}
              href={`/grades?week=${s}`}
              title={`Week ${i + 1} · ${formatShortDate(s)}${now ? " · this week" : ""}`}
              aria-label={`Week ${i + 1}, ${formatShortDate(s)}`}
              aria-current={selected ? "page" : undefined}
              className="group grid h-7 flex-1 place-items-center"
            >
              <span
                className={`rotate-45 transition group-hover:scale-150 ${
                  selected
                    ? "size-2.5 bg-[var(--ex-gold)] shadow-[0_0_10px] shadow-amber-400/80 sm:size-3"
                    : now
                      ? "size-1.5 border border-[var(--ex-gold)] bg-amber-400/40 sm:size-2"
                      : past
                        ? "size-1.5 bg-[var(--ex-gold-soft)] sm:size-2"
                        : "size-1.5 border border-line-strong sm:size-2"
                }`}
              />
            </Link>
          );
        })}
      </div>
      <div className="relative h-4" aria-hidden>
        {months.map(({ i, label }) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 text-[10px] tracking-[0.12em] text-slate-500 uppercase"
            style={{ left: `${((i + 0.5) / n) * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>
    </nav>
  );
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

/** How the class did on the Sunday on screen, in gold numbers like The Exodus's camp counts. */
export function ClassTally({ grades, students }: { grades: WeeklyGrade[]; students: number }) {
  const present = grades.filter((g) => g.present === true).length;
  const marked = grades.filter((g) => g.present !== null).length;
  const verse = average(grades.flatMap((g) => g.memoryVerse ?? []));
  const quiz = average(grades.flatMap((g) => g.quiz ?? []));
  const notes = grades.filter((g) => g.sermonNotes === true).length;
  const stats = [
    { label: "Present", value: marked ? `${present} of ${students}` : "—" },
    { label: "Verse average", value: verse ?? "—" },
    { label: "Quiz average", value: quiz ?? "—" },
    { label: "Sermon notes", value: marked ? `${notes} of ${students}` : "—" },
  ];
  return (
    <dl className="mb-6 grid grid-cols-2 border-y border-[var(--ex-rule)] py-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col-reverse border-line-subtle px-3 text-center ${i % 2 ? "border-l" : ""} ${
            i === 2 ? "sm:border-l" : ""
          } ${i >= 2 ? "mt-3 sm:mt-0" : ""}`}
        >
          <dt className="mt-0.5 text-[10px] tracking-[0.16em] text-slate-500 uppercase">{s.label}</dt>
          <dd className="font-display text-2xl font-semibold text-[var(--ex-gold)] tabular-nums sm:text-3xl">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
