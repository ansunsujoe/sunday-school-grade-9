"use client";

import { startTransition, useActionState, useState } from "react";
import { FormMessage } from "@/components/action-form";
import {
  Card,
  Field,
  buttonClass,
  inputClass,
  secondaryButtonClass,
} from "@/components/ui";
import type { QuizDraft } from "@/lib/actions/quizzes";
import type { FormState } from "@/lib/actions/types";

type Question = QuizDraft["questions"][number];

const blankQuestion = (): Question => ({ prompt: "", choices: ["", "", "", ""], correctIndex: 0 });

export function QuizBuilder({
  action,
  lessons,
  quizId,
  initial,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  lessons: { id: number; title: string }[];
  quizId?: number;
  initial?: QuizDraft;
}) {
  const [draft, setDraft] = useState<QuizDraft>(
    initial ?? { title: "", description: "", lessonId: null, questions: [blankQuestion()] },
  );
  const [state, formAction, pending] = useActionState(action, undefined);

  const updateQuestion = (index: number, change: Partial<Question>) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === index ? { ...q, ...change } : q)),
    }));

  const removeQuestion = (index: number) =>
    setDraft((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== index) }));

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("draft", JSON.stringify(draft));
        if (quizId) formData.set("quizId", String(quizId));
        startTransition(() => formAction(formData));
      }}
    >
      <Card title="Details">
        <div className="space-y-4">
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Instructions (optional)" htmlFor="description">
            <textarea
              id="description"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Content (optional)" htmlFor="lesson">
            <select
              id="lesson"
              value={draft.lessonId ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, lessonId: e.target.value ? Number(e.target.value) : null })
              }
              className={inputClass}
            >
              <option value="">None</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {draft.questions.map((q, qi) => (
        <Card
          key={qi}
          title={
            <span className="flex items-center justify-between">
              Question {qi + 1}
              {draft.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-sm font-normal text-rose-300 hover:underline"
                >
                  Remove
                </button>
              )}
            </span>
          }
        >
          <div className="space-y-3">
            <textarea
              aria-label={`Question ${qi + 1} prompt`}
              rows={2}
              placeholder="What did Jesus say to Nicodemus?"
              value={q.prompt}
              onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
              className={inputClass}
            />
            <p className="text-xs text-slate-400">Select the circle next to the correct answer.</p>
            {q.choices.map((choice, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  aria-label={`Choice ${ci + 1} is correct`}
                  checked={q.correctIndex === ci}
                  onChange={() => updateQuestion(qi, { correctIndex: ci })}
                  className="h-4 w-4 accent-emerald-400"
                />
                <input
                  aria-label={`Choice ${ci + 1}`}
                  placeholder={`Choice ${ci + 1}`}
                  value={choice}
                  onChange={(e) =>
                    updateQuestion(qi, {
                      choices: q.choices.map((c, i) => (i === ci ? e.target.value : c)),
                    })
                  }
                  className={inputClass}
                />
                {q.choices.length > 2 && (
                  <button
                    type="button"
                    aria-label={`Remove choice ${ci + 1}`}
                    onClick={() =>
                      updateQuestion(qi, {
                        choices: q.choices.filter((_, i) => i !== ci),
                        correctIndex:
                          q.correctIndex === ci ? 0 : q.correctIndex > ci ? q.correctIndex - 1 : q.correctIndex,
                      })
                    }
                    className="px-2 text-slate-500 hover:text-rose-300"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {q.choices.length < 6 && (
              <button
                type="button"
                onClick={() => updateQuestion(qi, { choices: [...q.choices, ""] })}
                className="text-sm text-amber-300 hover:underline"
              >
                + Add choice
              </button>
            )}
          </div>
        </Card>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setDraft((d) => ({ ...d, questions: [...d.questions, blankQuestion()] }))}
          className={secondaryButtonClass}
        >
          + Add question
        </button>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save quiz"}
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
