import Link from "next/link";
import { Icon } from "@/components/icons";
import { Card, inputClass, segmentClass, segmentTones } from "@/components/ui";
import type { SeasonSummary, WeeklyGrade } from "@/lib/season";

export function StudentWeek({
  student,
  grade,
}: {
  student: { id: number; name: string };
  grade: WeeklyGrade | undefined;
}) {
  const id = student.id;
  return (
    <li className="rounded-2xl border border-white/[0.07] bg-night-900/70 p-4 backdrop-blur-sm">
      <input type="hidden" name="studentId" value={id} />
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate font-semibold text-slate-100">{student.name}</span>
        <Link
          href={`/grades/students/${id}`}
          className="shrink-0 text-xs font-medium text-slate-500 hover:text-amber-300"
        >
          Season →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
        <Slot label="Attendance">
          <Toggle name={`present-${id}`} value={grade?.present ?? null} yes="P" no="A" />
        </Slot>
        <Slot label="Memory verse">
          <ScoreInput name={`memoryVerse-${id}`} value={grade?.memoryVerse ?? null} label={`${student.name} memory verse`} />
        </Slot>
        <Slot label="Quiz">
          <ScoreInput name={`quiz-${id}`} value={grade?.quiz ?? null} label={`${student.name} quiz`} />
        </Slot>
        <Slot label="Sermon notes">
          <Toggle name={`sermonNotes-${id}`} value={grade?.sermonNotes ?? null} yes="Y" no="N" />
        </Slot>
      </div>
    </li>
  );
}

function Slot({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{label}</div>
      {children}
    </div>
  );
}

/** Yes / No / blank segmented control. Submits "Y", "N", or "". */
function Toggle({
  name,
  value,
  yes,
  no,
}: {
  name: string;
  value: boolean | null;
  yes: string;
  no: string;
}) {
  const options = [
    { submit: "Y", label: yes, checked: value === true, tone: segmentTones.yes },
    { submit: "N", label: no, checked: value === false, tone: segmentTones.no },
    { submit: "", label: "–", checked: value === null, tone: segmentTones.blank },
  ];
  return (
    <div className="flex gap-1 rounded-xl bg-night-800/80 p-1 ring-1 ring-white/10">
      {options.map((o) => (
        <label key={o.submit} className="flex-1 cursor-pointer" title={o.submit ? undefined : "Leave blank"}>
          <input
            type="radio"
            name={name}
            value={o.submit}
            defaultChecked={o.checked}
            className="peer sr-only"
          />
          <span className={`${segmentClass} ${o.tone}`}>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function ScoreInput({ name, value, label }: { name: string; value: number | null; label: string }) {
  return (
    <div className="relative">
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
        className={`${inputClass} h-12 pr-12 font-semibold tabular-nums`}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-500">
        /100
      </span>
    </div>
  );
}

export function Overview({
  rows,
}: {
  rows: { student: { id: number; name: string }; summary: SeasonSummary }[];
}) {
  const pct = (v: number | null, suffix = "%") => (v == null ? "–" : `${v}${suffix}`);
  return (
    <Card title="Season overview" className="lg:sticky lg:top-24">
      <ul className="-mx-2 space-y-1">
        {rows.map(({ student, summary }) => (
          <li key={student.id}>
            <Link
              href={`/grades/students/${student.id}`}
              className="block rounded-xl px-2 py-2.5 transition hover:bg-white/5"
            >
              <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                {student.name}
                <Icon name="chevronRight" className="size-4 text-slate-600" />
              </div>
              <div className="mt-1.5 grid grid-cols-4 gap-1 text-center text-[11px] text-slate-500">
                {[
                  ["Att.", pct(summary.attendance)],
                  ["Verse", pct(summary.memoryVerse, "")],
                  ["Quiz", pct(summary.quiz, "")],
                  ["Notes", pct(summary.sermonNotes)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/[0.03] py-1">
                    <div className="text-sm font-semibold text-slate-200 tabular-nums">{value}</div>
                    {label}
                  </div>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
