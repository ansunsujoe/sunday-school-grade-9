import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";

import { deleteNews, updateNews } from "@/lib/actions/exodus";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { gameNews } from "@/lib/db/schema";
import { BackLink } from "../../../game-ui";
import { NewsFields } from "../../news-fields";
import { Panel } from "../../../ornaments";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [article] = await db.select().from(gameNews).where(eq(gameNews.id, id));
  if (!article) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <BackLink href={`/exodus/news/${id}`}>Article</BackLink>
        <h1 className="font-display text-3xl font-semibold text-slate-50">Edit article</h1>
      </div>
      <Panel>
        <ActionForm action={updateNews} submitLabel="Save changes">
          <input type="hidden" name="id" value={id} />
          <NewsFields article={article} />
        </ActionForm>
      </Panel>
      <form action={deleteNews}>
        <input type="hidden" name="id" value={id} />
        <ConfirmButton label="Delete article" confirmLabel="Click again to delete" />
      </form>
    </div>
  );
}
