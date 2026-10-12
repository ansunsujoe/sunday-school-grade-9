import { ActionForm } from "@/components/action-form";
import { Field, inputClass } from "@/components/ui";
import { raiseMatter } from "@/lib/actions/exodus";
import { requireTeacher } from "@/lib/dal";
import { MAX_WORD_LENGTH } from "@/lib/exodus/council";
import { getRoleHolders } from "@/lib/exodus/queries";
import { BackLink } from "../../game-ui";
import { Panel } from "../../ornaments";
import { ClansAndSpeaker } from "../speaker-fields";

export default async function RaiseMatterPage() {
  await requireTeacher();
  const holders = await getRoleHolders();
  return (
    <div className="max-w-3xl">
      <BackLink href="/exodus/council">Council</BackLink>
      <h1 className="mb-1 font-display text-3xl font-semibold text-slate-50">Raise a matter</h1>
      <p className="mb-5 text-sm text-slate-400">
        Someone comes to a leader&apos;s tent. Choose the clan, who comes, and what they say. If they&apos;ve
        spoken with that clan before, it carries on the same conversation.
      </p>
      <Panel>
        <ActionForm action={raiseMatter} submitLabel="Send to their tents" pendingLabel="Sending…">
          <ClansAndSpeaker holders={holders} legend="Who comes to the tent" />
          <Field label="What they say" htmlFor="body">
            <textarea
              id="body"
              name="body"
              required
              rows={6}
              maxLength={MAX_WORD_LENGTH}
              placeholder="e.g. My lord, the Amalekites took two of our goats in the night. My children are hungry. What will you do?"
              className={`${inputClass} leading-6`}
            />
          </Field>
        </ActionForm>
      </Panel>
    </div>
  );
}
