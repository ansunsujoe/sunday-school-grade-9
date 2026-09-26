"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/actions/types";
import { buttonClass } from "./ui";

// Submits via onSubmit instead of the form `action` prop so React doesn't
// clear the fields when the server returns a validation error.
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Saving…",
  resetOnSuccess = false,
  className = "space-y-4",
  stickyFooter = false,
  children,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
  /** Pins the submit bar to the bottom of the screen, for long forms. */
  stickyFooter?: boolean;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      {children}
      <div
        className={
          stickyFooter
            ? "sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-night-800/90 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl md:bottom-4"
            : "flex flex-wrap items-center gap-3"
        }
      >
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? pendingLabel : submitLabel}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state?.error) return <p className="text-sm text-rose-300">{state.error}</p>;
  if (state?.success) return <p className="text-sm text-emerald-300">{state.success}</p>;
  return null;
}
