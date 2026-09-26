import Link from "next/link";
import { asc } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";
import { createUser, deleteStudent, resetPassword } from "@/lib/actions/students";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export default async function PeoplePage() {
  const me = await requireTeacher();
  const people = await db
    .select({ id: users.id, name: users.name, username: users.username, role: users.role })
    .from(users)
    .orderBy(asc(users.role), asc(users.name));

  return (
    <>
      <PageHeader
        title="People"
        description="Create accounts and give each student their username and password."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          {people.length === 0 ? (
            <EmptyState>No accounts yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-white/5">
              {people.map((p) => (
                <li key={p.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{p.name}</span>{" "}
                      <span className="text-sm text-slate-400">@{p.username}</span>{" "}
                      {p.role === "teacher" && <Badge tone="gold">Teacher</Badge>}
                    </div>
                    {p.role === "student" && (
                      <form action={deleteStudent}>
                        <input type="hidden" name="userId" value={p.id} />
                        <ConfirmButton label="Remove" confirmLabel={`Remove ${p.name} and all their grades?`} />
                      </form>
                    )}
                  </div>
                  {p.id === me.id && (
                    <Link
                      href="/account"
                      className="mt-2 inline-block text-sm text-amber-300 hover:text-amber-200"
                    >
                      Change my password →
                    </Link>
                  )}
                  {p.id !== me.id && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-100">
                        Reset password
                      </summary>
                      <ActionForm
                        action={resetPassword}
                        submitLabel="Set password"
                        resetOnSuccess
                        className="mt-2 flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="userId" value={p.id} />
                        <input
                          name="password"
                          aria-label={`New password for ${p.name}`}
                          placeholder="New password"
                          minLength={6}
                          required
                          className={`${inputClass} max-w-48`}
                        />
                      </ActionForm>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Add an account" className="h-fit">
          <ActionForm action={createUser} submitLabel="Create account" resetOnSuccess>
            <Field label="Full name" htmlFor="name">
              <input id="name" name="name" required className={inputClass} />
            </Field>
            <Field label="Username" htmlFor="username">
              <input
                id="username"
                name="username"
                required
                autoCapitalize="none"
                placeholder="e.g. johnd"
                className={inputClass}
              />
            </Field>
            <Field label="Starting password" htmlFor="password">
              <input id="password" name="password" required minLength={6} className={inputClass} />
            </Field>
            <Field label="Role" htmlFor="role">
              <select id="role" name="role" className={inputClass}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
