import type { weeklyGrades } from "@/lib/db/schema";
import { percent } from "@/lib/format";

export const SEASON_START = "2026-07-26";
export const SEASON_END = "2027-05-16";

/** Every Sunday of the class year, as YYYY-MM-DD strings. */
export const SUNDAYS: string[] = (() => {
  const days: string[] = [];
  const d = new Date(`${SEASON_START}T00:00:00Z`);
  while (d.toISOString().slice(0, 10) <= SEASON_END) {
    days.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return days;
})();

/** The most recent Sunday on or before `today`, clamped to the season. */
export function currentSunday(today: string) {
  return SUNDAYS.findLast((s) => s <= today) ?? SUNDAYS[0];
}

export type WeeklyGrade = typeof weeklyGrades.$inferSelect;

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/** Season totals for one student. Blank slots are ignored, not counted as zero. */
export function summarize(grades: WeeklyGrade[]) {
  const marked = grades.filter((g) => g.present !== null);
  const present = marked.filter((g) => g.present).length;
  const notes = grades.filter((g) => g.sermonNotes !== null);
  return {
    present,
    absent: marked.length - present,
    attendance: percent(present, marked.length),
    memoryVerse: average(grades.flatMap((g) => g.memoryVerse ?? [])),
    quiz: average(grades.flatMap((g) => g.quiz ?? [])),
    sermonNotes: percent(notes.filter((g) => g.sermonNotes).length, notes.length),
  };
}

export type SeasonSummary = ReturnType<typeof summarize>;
