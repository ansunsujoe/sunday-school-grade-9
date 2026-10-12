import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { deleteMemoryVerse, updateMemoryVerse } from "@/lib/actions/memory-verses";
import { requireTeacher } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { getMemoryVerses } from "@/lib/verses";
import { sundayOptions } from "../../sundays";
import { VerseFields } from "../../verse-fields";

export default async function EditMemoryVersePage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const verses = await getMemoryVerses();
  const verse = verses.find((v) => v.id === id);
  if (!verse) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/memory-verse"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Memory verse
      </Link>
      <PageHeader title="Edit memory verse" description={formatDate(verse.sunday)} />
      <div className="space-y-6">
        <Card>
          <ActionForm action={updateMemoryVerse} submitLabel="Save changes">
            <input type="hidden" name="id" value={id} />
            <VerseFields sundays={sundayOptions(verses, id)} verse={verse} />
          </ActionForm>
        </Card>
        <form action={deleteMemoryVerse}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton label="Delete verse" confirmLabel="Click again to delete" />
        </form>
      </div>
    </div>
  );
}
