import { ActionForm } from "@/components/action-form";

import { createNews } from "@/lib/actions/exodus";
import { requireTeacher } from "@/lib/dal";
import { BackLink } from "../../game-ui";
import { NewsFields } from "../news-fields";
import { Panel } from "../../ornaments";

export default async function NewNewsPage() {
  await requireTeacher();
  return (
    <div className="max-w-3xl">
      <BackLink href="/exodus/news">Camp News</BackLink>
      <h1 className="font-display text-3xl font-semibold text-slate-50">Post news</h1>
      <p className="mt-2 mb-5 text-sm text-slate-400">Every clan can read it, and Joshua tells each leader about it in the council. Articles are signed by Joshua Nun.</p>
      <Panel>
        <ActionForm action={createNews} submitLabel="Post" pendingLabel="Posting…">
          <NewsFields />
        </ActionForm>
      </Panel>
    </div>
  );
}
