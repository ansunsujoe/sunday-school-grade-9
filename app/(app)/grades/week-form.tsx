import Link from "next/link";
import type { YearSummary, WeeklyGrade } from "@/lib/school-year";
import { CycleCell } from "./cycle-cell";

type Row = { student: { id: number; name: string }; grade: WeeklyGrade | undefined; summary: YearSummary };

const cell = "border-l border-line-subtle p-0";
const head = "border-l border-line-subtle px-1.5 py-2 text-center font-medium";
// School-year totals only show where there's room, so the table fits a phone without scrolling.
const year = "hidden text-slate-500 sm:table-cell";
const yearCell = `${year} border-l border-line-subtle px-2 text-center text-xs tabular-nums`;
// Greys a cell out while the row's attendance is marked absent (A).
const dim =
  "transition group-has-[[data-absent]]/row:pointer-events-none group-has-[[data-absent]]/row:opacity-20";

/** One Sunday for the whole class, laid out like a spreadsheet. Tap P/A and Y/N cells to cycle them. */
export function WeekSheet({ rows }: { rows: Row[] }) {
  const pct = (v: number | null, suffix = "%") => (v == null ? "–" : `${v}${suffix}`);
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-night-900/60">
      {/* Fixed layout: the name column has a set width and the grade columns share the rest evenly. */}
      <table className="w-full table-fixed border-collapse text-sm">
        <thead className="bg-night-800/80 text-[11px] text-slate-400">
          <tr>
            <th className="w-28 px-3 py-2 text-left font-medium sm:w-48 lg:w-64">Student</th>
            <th className={head}>Att.</th>
            <th className={head}>Verse</th>
            <th className={head}>Quiz</th>
            <th className={head}>Notes</th>
            <th className={`${head} ${year} border-l-line-strong`}>Year att.</th>
            <th className={`${head} ${year}`}>Year quiz</th>
            <th className={`${head} ${year}`}>Year notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, grade, summary }) => {
            const id = student.id;
            return (
              <tr key={id} className="group/row border-t border-line-subtle">
                <th className="px-3 text-left font-medium text-slate-200">
                  <input type="hidden" name="studentId" value={id} />
                  <Link
                    href={`/grades/students/${id}`}
                    className="block truncate py-2 hover:text-amber-300"
                    title={`${student.name}: school year`}
                  >
                    {student.name}
                  </Link>
                </th>
                <td className={cell}>
                  <CycleCell
                    name={`present-${id}`}
                    value={grade?.present ?? null}
                    yes="P"
                    no="A"
                    label={`${student.name} attendance`}
                    marksAbsent
                  />
                </td>
                <td className={`${cell} ${dim}`}>
                  <ScoreInput name={`memoryVerse-${id}`} value={grade?.memoryVerse ?? null} label={`${student.name} memory verse`} />
                </td>
                <td className={`${cell} ${dim}`}>
                  <ScoreInput name={`quiz-${id}`} value={grade?.quiz ?? null} label={`${student.name} quiz`} />
                </td>
                <td className={`${cell} ${dim}`}>
                  <CycleCell
                    name={`sermonNotes-${id}`}
                    value={grade?.sermonNotes ?? null}
                    yes="Y"
                    no="N"
                    label={`${student.name} sermon notes`}
                  />
                </td>
                <td className={`${yearCell} border-l-line-strong`}>{pct(summary.attendance)}</td>
                <td className={yearCell}>{pct(summary.quiz, "")}</td>
                <td className={yearCell}>{pct(summary.sermonNotes)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// text-base on phones keeps iOS from zooming in when the cell is focused.
function ScoreInput({ name, value, label }: { name: string; value: number | null; label: string }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      name={name}
      aria-label={`${label} (out of 100)`}
      min={0}
      max={100}
      step={1}
      placeholder="–"
      defaultValue={value ?? ""}
      className="h-9 w-full bg-transparent text-center text-base font-semibold text-slate-100 tabular-nums placeholder:text-slate-600 focus:bg-amber-400/10 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-inset sm:text-sm"
    />
  );
}
