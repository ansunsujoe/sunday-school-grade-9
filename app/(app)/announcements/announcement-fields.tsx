"use client";

import { useState } from "react";
import { Field, inputClass, segmentClass } from "@/components/ui";
import type { AnnouncementAudience } from "@/lib/db/schema";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone", tone: "peer-checked:bg-sky-400 peer-checked:text-ink" },
  { value: "selected", label: "Selected students", tone: "peer-checked:bg-violet-400 peer-checked:text-ink" },
] as const;

type Student = { id: number; name: string };

export function AnnouncementFields({
  announcement,
  students,
  recipientIds = [],
}: {
  announcement?: { title: string; body: string; audience: AnnouncementAudience };
  students: Student[];
  recipientIds?: number[];
}) {
  const [audience, setAudience] = useState<AnnouncementAudience>(announcement?.audience ?? "all");
  const [chosen, setChosen] = useState(() => new Set(recipientIds));

  const toggle = (id: number) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. No class this Sunday"
          defaultValue={announcement?.title}
          className={inputClass}
        />
      </Field>
      <Field label="Message" htmlFor="body">
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          placeholder={"Write the announcement here. **Bold**, *italic*, - bullet lists, and [links](https://…) all work."}
          defaultValue={announcement?.body}
          className={`${inputClass} leading-6`}
        />
        <p className="text-xs text-slate-500">
          Formatting: <code>**bold**</code>, <code>*italic*</code>, <code>- list</code>,{" "}
          <code>[link](https://…)</code>
        </p>
      </Field>

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-sm font-medium text-slate-300">Who sees it</legend>
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-night-800/80 p-1">
          {AUDIENCE_OPTIONS.map((o) => (
            <label key={o.value}>
              <input
                type="radio"
                name="audience"
                value={o.value}
                checked={audience === o.value}
                onChange={() => setAudience(o.value)}
                className="peer sr-only"
              />
              <span className={`${segmentClass} cursor-pointer px-3.5 ${o.tone}`}>{o.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {audience === "all"
            ? "Every student and teacher will see it."
            : "Only the students you check (and teachers) will see it."}
        </p>
      </fieldset>

      {audience === "selected" && (
        <fieldset className="space-y-2 rounded-xl border border-line bg-wash p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-sm font-medium text-slate-300">
              Students <span className="text-slate-500">· {chosen.size} chosen</span>
            </legend>
            <div className="flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setChosen(new Set(students.map((s) => s.id)))}
                className="rounded-lg px-2 py-1 font-medium text-slate-400 transition hover:bg-wash-hover hover:text-amber-200"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setChosen(new Set())}
                className="rounded-lg px-2 py-1 font-medium text-slate-400 transition hover:bg-wash-hover hover:text-amber-200"
              >
                Clear
              </button>
            </div>
          </div>
          {students.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">No student accounts yet.</p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {students.map((s) => (
                <li key={s.id}>
                  <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-slate-200 transition hover:bg-wash-hover">
                    <input
                      type="checkbox"
                      name="recipients"
                      value={s.id}
                      checked={chosen.has(s.id)}
                      onChange={() => toggle(s.id)}
                      className="size-4 accent-violet-400"
                    />
                    {s.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      )}
    </>
  );
}
