import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import type { MemoryVerse } from "@/lib/db/schema";
import { requireUser } from "@/lib/dal";
import { formatDate, today } from "@/lib/format";
import { currentSunday } from "@/lib/school-year";
import { getMemoryVerse, getMemoryVerses } from "@/lib/verses";
import { VersePractice } from "./practice";

export default async function MemoryVersePage() {
  const user = await requireUser();
  const isTeacher = user.role === "teacher";
  const verse = await getMemoryVerse(currentSunday(today()));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={verse ? `Memory verse · from ${formatDate(verse.sunday)}` : "Memory verse"}
        title={verse?.reference ?? "Memory verse"}
        description={verse && "Practice until you can type it without seeing the words."}
        action={
          isTeacher && (
            <Link href="/memory-verse/new" className={buttonClass}>
              <Icon name="plus" className="size-4" /> Add verse
            </Link>
          )
        }
      />
      {verse ? (
        <VersePractice key={verse.id} text={verse.text} reference={verse.reference} />
      ) : (
        <EmptyState>No memory verse yet.</EmptyState>
      )}
      {isTeacher && <Schedule current={verse} />}
    </div>
  );
}

/** Every verse in the schedule, with the one up this week marked. Teachers only. */
async function Schedule({ current }: { current: MemoryVerse | null }) {
  const verses = await getMemoryVerses();
  return (
    <section className="mt-12">
      <div className="border-b border-line pb-2">
        <h2 className="font-display text-lg font-semibold text-slate-100">Schedule</h2>
      </div>
      {verses.length === 0 ? (
        <EmptyState>Add a verse and it shows here.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-faint">
          {verses.map((v) => (
            <li key={v.id}>
              <Link
                href={`/memory-verse/${v.id}/edit`}
                className="group flex items-center gap-4 py-3"
              >
                <span className="w-28 shrink-0 text-sm text-slate-500 tabular-nums">{formatDate(v.sunday)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-medium text-slate-100 group-hover:text-amber-200">
                    {v.reference}
                    {v.id === current?.id && <Badge tone="gold">This week</Badge>}
                  </span>
                  <span className="block truncate text-sm text-slate-400">{v.text}</span>
                </span>
                <Icon name="pencil" className="size-4 shrink-0 text-slate-500 group-hover:text-amber-200" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
