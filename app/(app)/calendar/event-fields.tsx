import { Field, inputClass, segmentClass } from "@/components/ui";
import type { CalendarEvent } from "@/lib/db/schema";
import { TONES } from "./event-tone";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Teachers & students", tone: "peer-checked:bg-sky-400 peer-checked:text-ink" },
  { value: "teachers", label: "Teachers only", tone: "peer-checked:bg-violet-400 peer-checked:text-ink" },
] as const;

type EventValues = Pick<CalendarEvent, "title" | "date" | "startTime" | "endTime" | "audience" | "noSundaySchool">;

/** The time input wants HH:MM; Postgres hands back HH:MM:SS. */
const hhmm = (time: string | null | undefined) => time?.slice(0, 5) ?? "";

export function EventFields({ event, defaultDate }: { event?: EventValues; defaultDate?: string }) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Memory Verse Exam"
          defaultValue={event?.title}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" htmlFor="date">
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={event?.date ?? defaultDate}
            className={`${inputClass} scheme-adaptive`}
          />
        </Field>
        <Field label="Start time (optional)" htmlFor="startTime">
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={hhmm(event?.startTime)}
            className={`${inputClass} scheme-adaptive`}
          />
        </Field>
        <Field label="End time (optional)" htmlFor="endTime">
          <input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={hhmm(event?.endTime)}
            className={`${inputClass} scheme-adaptive`}
          />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-slate-500">Leave the times blank for an all-day event.</p>

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-sm font-medium text-slate-300">Who sees it</legend>
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-night-800/80 p-1">
          {AUDIENCE_OPTIONS.map((o) => (
            <label key={o.value}>
              <input
                type="radio"
                name="audience"
                value={o.value}
                defaultChecked={(event?.audience ?? "all") === o.value}
                className="peer sr-only"
              />
              <span className={`${segmentClass} cursor-pointer px-3.5 ${o.tone}`}>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-wash p-3 transition hover:bg-wash">
        <input
          type="checkbox"
          name="noSundaySchool"
          defaultChecked={event?.noSundaySchool}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 shrink-0 rounded-full bg-night-600 transition peer-checked:bg-rose-400 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
        <span className="text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-100">
            <span className={`size-2 rounded-full ${TONES.closed.dot}`} />
            No Sunday School
          </span>
          <span className="text-slate-400">Shows the day in red on the calendar.</span>
        </span>
      </label>
    </>
  );
}
