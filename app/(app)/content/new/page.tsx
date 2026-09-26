import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { createContent } from "@/lib/actions/content";
import { requireTeacher } from "@/lib/dal";
import { ContentFields } from "../content-fields";

export default async function NewContentPage() {
  await requireTeacher();
  return (
    <>
      <Link
        href="/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100"
      >
        <Icon name="arrowLeft" className="size-4" /> Content
      </Link>
      <PageHeader
        title="New content"
        description="Link to a document, write the page here, or both."
      />
      <Card>
        <ActionForm action={createContent} submitLabel="Create">
          <ContentFields />
        </ActionForm>
      </Card>
    </>
  );
}
