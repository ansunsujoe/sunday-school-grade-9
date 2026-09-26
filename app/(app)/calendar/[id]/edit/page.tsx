import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { deleteEvent, updateEvent } from "@/lib/actions/events";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { EventFields } from "../../event-fields";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [event] = await db.select().from(events).where(eq(events.id, id));
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/calendar?month=${event.date.slice(0, 7)}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Calendar
      </Link>
      <PageHeader title="Edit event" description={formatDate(event.date)} />
      <div className="space-y-6">
        <Card>
          <ActionForm action={updateEvent} submitLabel="Save changes">
            <input type="hidden" name="id" value={id} />
            <EventFields event={event} />
          </ActionForm>
        </Card>
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton label="Delete event" confirmLabel="Click again to delete" />
        </form>
      </div>
    </div>
  );
}
