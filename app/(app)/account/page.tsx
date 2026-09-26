import { ActionForm } from "@/components/action-form";
import { Card, Field, PageHeader, inputClass } from "@/components/ui";
import { changePassword } from "@/lib/actions/auth";
import { requireUser } from "@/lib/dal";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="My account" description={`Signed in as @${user.username}`} />
      <Card title="Change password" className="max-w-md">
        <ActionForm action={changePassword} submitLabel="Update password" resetOnSuccess>
          <Field label="Current password" htmlFor="current">
            <input id="current" name="current" type="password" autoComplete="current-password" required className={inputClass} />
          </Field>
          <Field label="New password" htmlFor="next">
            <input id="next" name="next" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm">
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
          </Field>
        </ActionForm>
      </Card>
    </>
  );
}
