import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { createEvent } from "@/lib/actions/events";
import { requireTeacher } from "@/lib/dal";
import { EventFields } from "../event-fields";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireTeacher();
  const { date } = await searchParams;
  const defaultDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={defaultDate ? `/calendar?month=${defaultDate.slice(0, 7)}` : "/calendar"}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Calendar
      </Link>
      <PageHeader title="New event" />
      <Card>
        <ActionForm action={createEvent} submitLabel="Add event">
          <EventFields defaultDate={defaultDate} />
        </ActionForm>
      </Card>
    </div>
  );
}
