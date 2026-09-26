"use client";

import { ActionForm } from "@/components/action-form";
import { Field, inputClass } from "@/components/ui";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  return (
    <ActionForm action={login} submitLabel="Sign in" pendingLabel="Signing in…">
      <Field label="Username" htmlFor="username">
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className={inputClass}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
    </ActionForm>
  );
}
