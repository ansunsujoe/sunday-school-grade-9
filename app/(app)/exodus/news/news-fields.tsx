import { Field, inputClass } from "@/components/ui";

export function NewsFields({ article }: { article?: { title: string; content: string } }) {
  return (
    <>
      <Field label="Headline" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Pharaoh's army spotted behind the camp"
          defaultValue={article?.title}
          className={inputClass}
        />
      </Field>
      <Field label="Article" htmlFor="content">
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          placeholder="Write the story. **Bold**, *italic*, - bullet lists, and > quotes all work."
          defaultValue={article?.content}
          className={`${inputClass} leading-6`}
        />
        <p className="text-xs text-slate-500">
          Formatting: <code>**bold**</code>, <code>*italic*</code>, <code>- list</code>, <code>&gt; quote</code>
        </p>
      </Field>
    </>
  );
}
