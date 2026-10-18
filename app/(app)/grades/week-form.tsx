import Link from "next/link";
import { scoreTone } from "@/components/ui";
import type { YearSummary, WeeklyGrade } from "@/lib/school-year";
import { CycleCell } from "./cycle-cell";

type Row = { student: { id: number; name: string }; grade: WeeklyGrade | undefined; summary: YearSummary };

const cell = "border-l border-line-subtle p-0";
const head = "border-l border-line-subtle px-1.5 pt-1 pb-2.5 text-center font-semibold";
// School-year totals only show where there's room, so the table fits a phone without scrolling.
const year = "hidden sm:table-cell";
const yearCell = `${year} border-l border-line-subtle px-2 text-center text-xs tabular-nums`;

// A year figure's little bar, colored like scores elsewhere.
const BAR = {
  slate: "bg-transparent",
  green: "bg-emerald-400/80",
  amber: "bg-orange-400/80",
  red: "bg-rose-400/80",
} as const;

/** A school-year figure with a small bar under it showing how full it is. */
function YearFigure({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  return (
    <>
      <span className={value == null ? "text-slate-600" : "font-semibold text-slate-200"}>
        {value == null ? "–" : `${value}${suffix}`}
      </span>
      <span className="mx-auto mt-1 block h-1 w-10 max-w-full overflow-hidden bg-wash" aria-hidden>
        <span className={`block h-full ${BAR[scoreTone(value)]}`} style={{ width: `${value ?? 0}%` }} />
      </span>
    </>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
// Greys a cell out while the row's attendance is marked absent (A).
const dim =
  "transition group-has-[[data-absent]]/row:pointer-events-none group-has-[[data-absent]]/row:opacity-20";

/** One Sunday for the whole class, laid out like a spreadsheet. Tap P/A and Y/N cells to cycle them. */
export function WeekSheet({ rows }: { rows: Row[] }) {
  return (
    <div className="ex-panel overflow-hidden">
      {/* Fixed layout: the name column has a set width and the grade columns share the rest evenly. */}
      <table className="w-full table-fixed border-collapse text-sm">
        <thead className="border-b border-[var(--ex-rule)] bg-linear-to-b from-amber-400/[0.09] to-amber-400/[0.03] font-display text-[10px] tracking-[0.14em] uppercase">
          {/* Banners over the two halves: this Sunday, and the school year so far. */}
          <tr>
            <th className="w-28 sm:w-48 lg:w-64" />
            <th colSpan={4} className="border-l border-line-subtle pt-2.5 text-center font-semibold tracking-[0.2em] text-[var(--ex-gold)]">
              This Sunday
            </th>
            <th colSpan={3} className={`${year} border-l border-l-line-strong pt-2.5 text-center font-semibold tracking-[0.2em] text-slate-500`}>
              School year
            </th>
          </tr>
          <tr>
            <th className="px-3 pt-1 pb-2.5 text-left font-semibold text-[var(--ex-gold)]">Student</th>
            <th className={`${head} text-amber-200/90`}>Att.</th>
            <th className={`${head} text-amber-200/90`}>Verse</th>
            <th className={`${head} text-amber-200/90`}>Quiz</th>
            <th className={`${head} text-amber-200/90`}>Notes</th>
            <th className={`${head} ${year} border-l-line-strong text-slate-500`}>Att.</th>
            <th className={`${head} ${year} text-slate-500`}>Quiz</th>
            <th className={`${head} ${year} text-slate-500`}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, grade, summary }) => {
            const id = student.id;
            return (
              <tr
                key={id}
                className="group/row border-t border-line-faint transition-colors even:bg-amber-400/[0.025] hover:bg-amber-400/[0.06]"
              >
                <th className="px-3 text-left font-medium text-slate-100">
                  <input type="hidden" name="studentId" value={id} />
                  <Link
                    href={`/grades/students/${id}`}
                    className="flex items-center gap-2.5 py-2 hover:text-amber-300 lg:py-2.5"
                    title={`${student.name}: school year`}
                  >
                    <span
                      aria-hidden
                      className="hidden size-7 shrink-0 place-items-center rounded-full bg-night-700 text-[10px] font-semibold text-amber-200 ring-1 ring-amber-400/30 sm:grid"
                    >
                      {initials(student.name)}
                    </span>
                    <span className="truncate">{student.name}</span>
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
                <td className={`${yearCell} border-l-line-strong`}>
                  <YearFigure value={summary.attendance} />
                </td>
                <td className={yearCell}>
                  <YearFigure value={summary.quiz} suffix="" />
                </td>
                <td className={yearCell}>
                  <YearFigure value={summary.sermonNotes} />
                </td>
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
      className="h-10 w-full bg-transparent text-center text-base font-semibold text-amber-50 tabular-nums placeholder:text-slate-600 focus:bg-amber-400/10 focus:ring-2 focus:ring-amber-300 focus:outline-none focus:ring-inset sm:text-sm lg:h-12"
    />
  );
}
