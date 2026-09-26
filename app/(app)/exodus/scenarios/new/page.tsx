import { ActionForm } from "@/components/action-form";
import { Card, Field, inputClass } from "@/components/ui";
import { createScenario } from "@/lib/actions/exodus";
import { requireTeacher } from "@/lib/dal";
import { CLANS } from "@/lib/exodus/clans";
import { ClanPicker } from "../../clan-picker";
import { BackLink } from "../../game-ui";

export default async function NewScenarioPage() {
  await requireTeacher();
  return (
    <div className="max-w-3xl">
      <BackLink href="/exodus/scenarios">Scenarios</BackLink>
      <h1 className="mb-5 font-display text-3xl font-semibold text-slate-50">New scenario</h1>
      <Card>
        <ActionForm action={createScenario} submitLabel="Send scenario" pendingLabel="Sending…">
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Bitter water at Marah"
              className={inputClass}
            />
          </Field>
          <Field label="What happens?" htmlFor="prompt">
            <textarea
              id="prompt"
              name="prompt"
              required
              rows={8}
              placeholder={
                "Describe the situation and ask the leader what their clan will do.\n\ne.g. After three days in the wilderness your clan finds water, but it is bitter. Your people are thirsty and starting to grumble. What do you do?"
              }
              className={`${inputClass} leading-6`}
            />
            <p className="text-xs text-slate-500">
              Formatting: <code>**bold**</code>, <code>*italic*</code>, <code>- list</code>
            </p>
          </Field>
          <ClanPicker clans={CLANS} />
        </ActionForm>
      </Card>
    </div>
  );
}
