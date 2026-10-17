import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/actions/announcements";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { getAnnouncementRecipients, getStudents } from "@/lib/queries";
import { AnnouncementFields } from "../../announcement-fields";

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
  if (!announcement) notFound();
  const [students, recipients] = await Promise.all([getStudents(), getAnnouncementRecipients([id])]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/announcements#a-${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Announcements
      </Link>
      <PageHeader
        title="Edit announcement"
        description={`Posted ${formatDateTime(announcement.createdAt)}. Edits don't mark it as new again, except for students you add.`}
      />
      <div className="space-y-6">
        <Card>
          <ActionForm action={updateAnnouncement} submitLabel="Save changes">
            <input type="hidden" name="id" value={id} />
            <AnnouncementFields
              announcement={announcement}
              students={students}
              recipientIds={recipients.get(id)?.map((s) => s.id)}
            />
          </ActionForm>
        </Card>
        <form action={deleteAnnouncement}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton label="Delete announcement" confirmLabel="Click again to delete" />
        </form>
      </div>
    </div>
  );
}
