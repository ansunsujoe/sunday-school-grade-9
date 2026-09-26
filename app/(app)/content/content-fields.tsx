import { Field, inputClass } from "@/components/ui";
import type { ContentKind } from "@/lib/db/schema";

type Content = {
  title: string;
  kind: ContentKind;
  url: string | null;
  body: string | null;
};

export function ContentFields({ content }: { content?: Content }) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <input id="title" name="title" required defaultValue={content?.title} className={inputClass} />
      </Field>
      <Field label="Type" htmlFor="kind">
        <select id="kind" name="kind" defaultValue={content?.kind ?? "lesson"} className={inputClass}>
          <option value="lesson">Lesson</option>
          <option value="supplementary">Supplementary</option>
        </select>
      </Field>
      <Field label="Link (optional)" htmlFor="url">
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          placeholder="https://docs.google.com/…"
          defaultValue={content?.url ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Page on the site (optional)" htmlFor="body">
        <textarea
          id="body"
          name="body"
          rows={12}
          placeholder={"## A heading\n\nWrite the lesson here. **Bold**, *italic*, - bullet lists, and > quotes all work."}
          defaultValue={content?.body ?? ""}
          className={`${inputClass} font-mono text-sm leading-6`}
        />
        <p className="text-xs text-slate-500">
          Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>,{" "}
          <code>- list</code>, <code>&gt; quote</code>, <code>[link](https://…)</code>
        </p>
      </Field>
    </>
  );
}
