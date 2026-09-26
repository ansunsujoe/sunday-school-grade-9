import { Field, inputClass } from "@/components/ui";

type Lesson = {
  date: string;
  title: string;
  scripture: string | null;
  notes: string | null;
};

export function LessonFields({ lesson }: { lesson?: Lesson }) {
  return (
    <>
      <Field label="Date" htmlFor="date">
        <input id="date" name="date" type="date" required defaultValue={lesson?.date} className={inputClass} />
      </Field>
      <Field label="Title" htmlFor="title">
        <input id="title" name="title" required defaultValue={lesson?.title} className={inputClass} />
      </Field>
      <Field label="Scripture" htmlFor="scripture">
        <input
          id="scripture"
          name="scripture"
          placeholder="e.g. John 3:1–21"
          defaultValue={lesson?.scripture ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Summary, discussion questions, homework…"
          defaultValue={lesson?.notes ?? ""}
          className={inputClass}
        />
      </Field>
    </>
  );
}
