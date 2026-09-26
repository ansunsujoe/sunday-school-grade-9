import { Field, inputClass } from "@/components/ui";

export function AnnouncementFields({ announcement }: { announcement?: { title: string; body: string } }) {
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
    </>
  );
}
