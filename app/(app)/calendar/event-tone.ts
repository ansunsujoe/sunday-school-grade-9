import type { CalendarEvent } from "@/lib/db/schema";

// Color coding: sky for events everyone sees, violet for teachers only, and
// rose for days with no Sunday School (which wins over the audience color).
export const TONES = {
  all: {
    label: "Teachers & students",
    dot: "bg-sky-400",
    bar: "bg-sky-400 shadow-[0_0_10px] shadow-sky-400/60",
    chip: "border-sky-400 bg-sky-400/10 text-sky-100 ring-sky-400/20 hover:bg-sky-400/20",
    text: "text-sky-300",
  },
  teachers: {
    label: "Teachers only",
    dot: "bg-violet-400",
    bar: "bg-violet-400 shadow-[0_0_10px] shadow-violet-400/60",
    chip: "border-violet-400 bg-violet-400/10 text-violet-100 ring-violet-400/25 hover:bg-violet-400/20",
    text: "text-violet-300",
  },
  closed: {
    label: "No Sunday School",
    dot: "bg-rose-400",
    bar: "bg-rose-400 shadow-[0_0_10px] shadow-rose-400/60",
    chip: "border-rose-400 bg-rose-400/10 text-rose-100 ring-rose-400/25 hover:bg-rose-400/20",
    text: "text-rose-300",
  },
} as const;

export type Tone = keyof typeof TONES;

export function eventTone(event: Pick<CalendarEvent, "audience" | "noSundaySchool">): Tone {
  if (event.noSundaySchool) return "closed";
  return event.audience;
}
