import { desc } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { ConfirmButton } from "@/components/confirm-button";
import { Icon } from "@/components/icons";
import { Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";
import { askQuestion, removeQuestion } from "@/lib/actions/question-box";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { questionBox } from "@/lib/db/schema";
import { formatDateTime, timeAgo } from "@/lib/format";

export default async function QuestionBoxPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-3xl">
      {user.role === "teacher" ? <TeacherInbox /> : <AskForm />}
    </div>
  );
}

function AskForm() {
  return (
    <>
      <PageHeader
        title="Question box"
        description="Ask your teachers anything: about the Bible, the lesson, or life."
      />
      <Card>
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3.5 text-sm text-slate-300">
          <Icon name="question" className="mt-0.5 size-5 shrink-0 text-emerald-300" />
          <p>
            <strong className="text-slate-100">It&apos;s anonymous.</strong> Your name isn&apos;t saved with
            your question, so your teachers only see what you wrote and when you sent it.
          </p>
        </div>
        <ActionForm action={askQuestion} submitLabel="Send question" pendingLabel="Sending…" resetOnSuccess>
          <Field label="Your question" htmlFor="body">
            <textarea
              id="body"
              name="body"
              required
              rows={5}
              maxLength={1000}
              placeholder="e.g. Why did God let the Israelites wander for forty years?"
              className={`${inputClass} leading-6`}
            />
          </Field>
        </ActionForm>
      </Card>
    </>
  );
}

async function TeacherInbox() {
  const items = await db.select().from(questionBox).orderBy(desc(questionBox.createdAt));

  return (
    <>
      <PageHeader
        title="Question box"
        description={
          items.length === 0
            ? "Anonymous questions from students show up here."
            : `${items.length} question${items.length === 1 ? "" : "s"} from students. Remove each one once it's been answered.`
        }
      />
      {items.length === 0 ? (
        <Card>
          <EmptyState>No questions right now.</EmptyState>
        </Card>
      ) : (
        <ol className="space-y-4">
          {items.map((q) => (
            <li key={q.id}>
              <Card>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                    <Icon name="question" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">
                      <time dateTime={q.createdAt.toISOString()}>{formatDateTime(q.createdAt)}</time>
                      <span className="text-slate-500"> · {timeAgo(q.createdAt)}</span>
                    </p>
                    <p className="mt-2 leading-relaxed break-words whitespace-pre-wrap text-slate-100">
                      {q.body}
                    </p>
                  </div>
                </div>
                <form action={removeQuestion} className="mt-4 flex justify-end">
                  <input type="hidden" name="id" value={q.id} />
                  <ConfirmButton label="Remove" confirmLabel="Click again to remove" />
                </form>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
