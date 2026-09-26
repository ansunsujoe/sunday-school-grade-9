import { Field, inputClass } from "@/components/ui";

type Lesson = {
  title: string;
  url: string;
};

export function LessonFields({ lesson }: { lesson?: Lesson }) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <input id="title" name="title" required defaultValue={lesson?.title} className={inputClass} />
      </Field>
      <Field label="Link to lesson" htmlFor="url">
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          required
          placeholder="https://docs.google.com/…"
          defaultValue={lesson?.url}
          className={inputClass}
        />
      </Field>
    </>
  );
}
