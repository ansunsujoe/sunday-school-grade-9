import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { deleteContent, updateContent } from "@/lib/actions/content";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { ContentFields } from "../../content-fields";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [item] = await db.select().from(lessons).where(eq(lessons.id, id));
  if (!item) notFound();

  return (
    <>
      <Link
        href={`/content/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> {item.title}
      </Link>
      <PageHeader title="Edit content" />
      <div className="max-w-4xl space-y-6">
        <Card>
          <ActionForm action={updateContent} submitLabel="Save changes">
            <input type="hidden" name="id" value={id} />
            <ContentFields content={item} />
          </ActionForm>
        </Card>
        <form action={deleteContent}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton label="Delete" confirmLabel="Click again to delete" />
        </form>
      </div>
    </>
  );
}
