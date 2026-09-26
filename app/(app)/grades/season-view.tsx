import { Card, Stat, scoreTone } from "@/components/ui";
import { formatMonth, formatShortDate, today } from "@/lib/format";
import { SUNDAYS, currentSunday, summarize, type WeeklyGrade } from "@/lib/season";

const TONE_TEXT = {
  slate: "text-slate-500",
  green: "text-emerald-300",
  amber: "text-orange-300",
  red: "text-rose-300",
} as const;

function YesNo({ value, yes, no }: { value: boolean | null; yes: string; no: string }) {
  if (value === null) return <span className="text-slate-600">–</span>;
  return (
    <span className={`font-semibold ${value ? "text-emerald-300" : "text-rose-300"}`}>
      {value ? yes : no}
    </span>
  );
}

function Score({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-600">–</span>;
  return <span className={`font-semibold tabular-nums ${TONE_TEXT[scoreTone(value)]}`}>{value}</span>;
}

/** Season stats and a week-by-week table for one student. */
export function SeasonView({ grades }: { grades: WeeklyGrade[] }) {
  const summary = summarize(grades);
  const byDate = new Map(grades.map((g) => [g.date, g]));
  const thisWeek = currentSunday(today());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Attendance" value={summary.attendance} />
        <Stat label="Memory verse avg" value={summary.memoryVerse} suffix="" />
        <Stat label="Quiz avg" value={summary.quiz} suffix="" />
        <Stat label="Sermon notes" value={summary.sermonNotes} />
      </div>

      <Card className="overflow-clip p-0!">
        <table className="w-full text-sm">
          <thead className="sticky top-[calc(61px+env(safe-area-inset-top))] bg-night-800/95 text-xs tracking-wide text-slate-400 uppercase backdrop-blur">
            <tr>
              <th className="py-3 pl-4 text-left font-medium sm:pl-6">Sunday</th>
              <th className="px-1 py-3 font-medium">Att.</th>
              <th className="px-1 py-3 font-medium">Verse</th>
              <th className="px-1 py-3 font-medium">Quiz</th>
              <th className="py-3 pr-4 pl-1 font-medium sm:pr-6">Notes</th>
            </tr>
          </thead>
          <tbody>
            {SUNDAYS.map((sunday, i) => {
              const g = byDate.get(sunday);
              const newMonth = i === 0 || sunday.slice(0, 7) !== SUNDAYS[i - 1].slice(0, 7);
              const isThisWeek = sunday === thisWeek;
              return [
                newMonth && (
                  <tr key={`${sunday}-month`}>
                    <th
                      colSpan={5}
                      className="border-t border-white/[0.06] bg-white/[0.02] py-2 pl-4 text-left font-display text-xs font-semibold tracking-wide text-amber-200/80 sm:pl-6"
                    >
                      {formatMonth(sunday)}
                    </th>
                  </tr>
                ),
                <tr
                  key={sunday}
                  className={`border-t border-white/[0.04] text-center ${
                    isThisWeek ? "bg-amber-400/[0.07]" : sunday > thisWeek ? "opacity-45" : ""
                  }`}
                >
                  <td className="py-2.5 pl-4 text-left whitespace-nowrap text-slate-300 sm:pl-6">
                    {formatShortDate(sunday)}
                    {isThisWeek && (
                      <span className="ml-2 text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                        Now
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-2.5">
                    <YesNo value={g?.present ?? null} yes="P" no="A" />
                  </td>
                  <td className="px-1 py-2.5">
                    <Score value={g?.memoryVerse ?? null} />
                  </td>
                  <td className="px-1 py-2.5">
                    <Score value={g?.quiz ?? null} />
                  </td>
                  <td className="py-2.5 pr-4 pl-1 sm:pr-6">
                    <YesNo value={g?.sermonNotes ?? null} yes="Y" no="N" />
                  </td>
                </tr>,
              ];
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
