import { ActionForm } from "@/components/action-form";
import { Card, EmptyState, PageHeader, TextLink } from "@/components/ui";
import { saveWeek } from "@/lib/actions/grades";
import { requireUser } from "@/lib/dal";
import { formatDate, formatShortDate, today } from "@/lib/format";
import { getStudents, getWeeklyGrades } from "@/lib/queries";
import { YEAR_END, YEAR_START, SUNDAYS, currentSunday, summarize } from "@/lib/school-year";
import { YearView } from "./year-view";
import { Overview, StudentWeek } from "./week-form";
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
      <PageHeader
        eyebrow="Gradebook"
        title={formatDate(date)}
        description={`Week ${SUNDAYS.indexOf(date) + 1} of ${SUNDAYS.length} · ${formatShortDate(YEAR_START)}, 2026 – ${formatShortDate(YEAR_END)}, 2027`}
      />
      {students.length === 0 ? (
        <Card>
          <EmptyState>
            Add students on the <TextLink href="/people">People</TextLink> page first.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-4">
            <WeekPicker
              weeks={SUNDAYS.map((s) => ({ value: s, label: formatShortDate(s) }))}
              value={date}
              current={thisWeek}
            />
            {/* Keyed by date so switching weeks resets the uncontrolled inputs. */}
            <ActionForm key={date} action={saveWeek} submitLabel="Save this Sunday" stickyFooter>
              <input type="hidden" name="date" value={date} />
              <ul className="space-y-3">
                {students.map((s) => (
                  <StudentWeek key={s.id} student={s} grade={forDate.get(s.id)} />
                ))}
              </ul>
            </ActionForm>
          </div>
          <Overview
            rows={students.map((s) => ({
              student: s,
              summary: summarize(grades.filter((g) => g.studentId === s.id)),
            }))}
          />
        </div>
      )}
    </>
  );
}
