import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { createMemoryVerse } from "@/lib/actions/memory-verses";
import { requireTeacher } from "@/lib/dal";
import { today } from "@/lib/format";
import { SUNDAYS, currentSunday } from "@/lib/school-year";
import { getMemoryVerses } from "@/lib/verses";
import { sundayOptions } from "../sundays";
import { VerseFields } from "../verse-fields";

export default async function NewMemoryVersePage() {
  await requireTeacher();
  const verses = await getMemoryVerses();
  // Start on the first Sunday from this week on that doesn't have a verse yet.
  const taken = new Set(verses.map((v) => v.sunday));
  const thisWeek = currentSunday(today());
  const defaultSunday = SUNDAYS.find((s) => s >= thisWeek && !taken.has(s));

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/memory-verse"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Memory verse
      </Link>
      <PageHeader title="New memory verse" description="It shows from its Sunday until the next verse starts." />
      <Card>
        <ActionForm action={createMemoryVerse} submitLabel="Add verse">
          <VerseFields sundays={sundayOptions(verses)} defaultSunday={defaultSunday} />
        </ActionForm>
      </Card>
    </div>
  );
}
