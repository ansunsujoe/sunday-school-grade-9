"use client";

import { useState, useTransition } from "react";
import { Field, inputClass, secondaryButtonClass } from "@/components/ui";
import { lookupMemoryVerse } from "@/lib/actions/memory-verses";

/**
 * Sunday, reference and KJV text for a memory verse. "Look up" fills the text
 * (and tidies the reference) from what the teacher typed; both stay editable.
 */
export function VerseFields({
  sundays,
  verse,
  defaultSunday,
}: {
  sundays: { value: string; label: string }[];
  verse?: { sunday: string; reference: string; text: string };
  defaultSunday?: string;
}) {
  const [reference, setReference] = useState(verse?.reference ?? "");
  const [text, setText] = useState(verse?.text ?? "");
  const [error, setError] = useState<string | null>(null);
  const [looking, startLookup] = useTransition();

  function lookup() {
    setError(null);
    startLookup(async () => {
      const result = await lookupMemoryVerse(reference);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setReference(result.reference);
      setText(result.text);
    });
  }

  return (
    <>
      <Field label="Sunday it starts" htmlFor="sunday">
        <select
          id="sunday"
          name="sunday"
          required
          defaultValue={verse?.sunday ?? defaultSunday}
          className={`${inputClass} scheme-adaptive`}
        >
          {sundays.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Reference" htmlFor="reference">
        <div className="flex gap-2">
          <input
            id="reference"
            name="reference"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            onKeyDown={(e) => {
              // Enter looks the verse up instead of submitting the form.
              if (e.key === "Enter") {
                e.preventDefault();
                lookup();
              }
            }}
            placeholder="e.g. John 3:16 or Psalm 119:9-11"
            autoComplete="off"
            className={inputClass}
          />
          <button
            type="button"
            onClick={lookup}
            disabled={looking || !reference.trim()}
            className={`${secondaryButtonClass} shrink-0`}
          >
            {looking ? "Looking…" : "Look up"}
          </button>
        </div>
      </Field>
      {error && <p className="-mt-2 text-sm text-rose-300">{error}</p>}

      <Field label="Verse (KJV)" htmlFor="text">
        <textarea
          id="text"
          name="text"
          required
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Look it up from the reference, or paste it in."
          className={`${inputClass} leading-6`}
        />
      </Field>
    </>
  );
}
