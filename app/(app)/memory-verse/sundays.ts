import type { MemoryVerse } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { SUNDAYS } from "@/lib/school-year";

/** Every Sunday of the year for the form's picker, naming the verse already on each one. */
export function sundayOptions(verses: MemoryVerse[], editingId?: number) {
  const taken = new Map(verses.filter((v) => v.id !== editingId).map((v) => [v.sunday, v.reference]));
  return SUNDAYS.map((s) => ({
    value: s,
    label: taken.has(s) ? `${formatDate(s)} · ${taken.get(s)}` : formatDate(s),
  }));
}
