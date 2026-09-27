import { ActionForm } from "@/components/action-form";
import { Card, EmptyState, PageHeader, TextLink } from "@/components/ui";
import { saveWeek } from "@/lib/actions/grades";
import { requireUser } from "@/lib/dal";
import { formatDate, formatShortDate, today } from "@/lib/format";
import { getStudents, getWeeklyGrades } from "@/lib/queries";
import { SUNDAYS, currentSunday, summarize } from "@/lib/school-year";
import { YearView } from "./year-view";
import { WeekSheet } from "./week-form";
import { WeekPicker } from "./week-picker";

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();

  if (user.role === "student") {
    return (
      <>
        <PageHeader
          eyebrow="2026 – 2027 school year"
          title="My grades"
          description="Every Sunday this year. Blank slots haven't been graded yet."
        />
        <YearView grades={await getWeeklyGrades(user.id)} />
      </>
    );
  }

  const { week } = await searchParams;
  const thisWeek = currentSunday(today());
  const date = typeof week === "string" && SUNDAYS.includes(week) ? week : thisWeek;

  const [students, grades] = await Promise.all([getStudents(), getWeeklyGrades()]);
  const forDate = new Map(grades.filter((g) => g.date === date).map((g) => [g.studentId, g]));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-50">Gradebook</h1>
          <p className="text-xs text-slate-500">
            Week {SUNDAYS.indexOf(date) + 1} of {SUNDAYS.length} · {formatDate(date)}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <WeekPicker
            weeks={SUNDAYS.map((s) => ({ value: s, label: formatShortDate(s) }))}
            value={date}
            current={thisWeek}
          />
        </div>
      </div>
      {students.length === 0 ? (
        <Card>
          <EmptyState>
            Add students on the <TextLink href="/people">People</TextLink> page first.
          </EmptyState>
        </Card>
      ) : (
        // Keyed by date so switching weeks resets the cells.
        <ActionForm key={date} action={saveWeek} submitLabel="Save" className="space-y-3">
          <input type="hidden" name="date" value={date} />
          <WeekSheet
            rows={students.map((s) => ({
              student: s,
              grade: forDate.get(s.id),
              summary: summarize(grades.filter((g) => g.studentId === s.id)),
            }))}
          />
          <p className="text-xs text-slate-500">
            Tap Att. and Notes cells to cycle them. Tap a name for that student&apos;s whole year.
          </p>
        </ActionForm>
      )}
    </>
  );
}
