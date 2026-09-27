"use client";

import { useState } from "react";

const TONES = {
  Y: "bg-emerald-400/15 text-emerald-300",
  N: "bg-rose-400/15 text-rose-300",
  "": "text-slate-600",
} as const;

type Value = keyof typeof TONES;
const NEXT: Record<Value, Value> = { "": "Y", Y: "N", N: "" };

/** A spreadsheet cell that cycles blank → yes → no on tap. Submits "Y", "N", or "". */
export function CycleCell({
  name,
  value,
  yes,
  no,
  label,
  marksAbsent = false,
}: {
  name: string;
  value: boolean | null;
  yes: string;
  no: string;
  label: string;
  /** Flags the row as absent when set to "no", so the other cells grey out. */
  marksAbsent?: boolean;
}) {
  const [v, setV] = useState<Value>(value === true ? "Y" : value === false ? "N" : "");
  const text = v === "Y" ? yes : v === "N" ? no : "–";
  return (
    <>
      <input type="hidden" name={name} value={v} />
      <button
        type="button"
        onClick={() => setV(NEXT[v])}
        data-absent={(marksAbsent && v === "N") || undefined}
        aria-label={`${label}: ${v === "Y" ? yes : v === "N" ? no : "blank"}. Tap to change.`}
        className={`grid h-9 w-full place-items-center text-sm font-semibold tabular-nums transition select-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none focus-visible:ring-inset ${TONES[v]}`}
      >
        {text}
      </button>
    </>
  );
}
