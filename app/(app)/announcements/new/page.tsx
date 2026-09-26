import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { createAnnouncement } from "@/lib/actions/announcements";
import { requireTeacher } from "@/lib/dal";
import { AnnouncementFields } from "../announcement-fields";

export default async function NewAnnouncementPage() {
  await requireTeacher();
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/announcements"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Announcements
      </Link>
      <PageHeader title="New announcement" description="Everyone in the class will see it, marked as new." />
      <Card>
        <ActionForm action={createAnnouncement} submitLabel="Post" pendingLabel="Posting…">
          <AnnouncementFields />
        </ActionForm>
      </Card>
    </div>
  );
}
