// Building blocks for lesson pages in app/(app)/content/<slug>/page.tsx.
// Plain JSX (<p>, <ul>, <strong>…) inside <Prose> or <LessonSection> picks up
// the app's reading style; these components add the lesson-specific pieces.

import { proseClass } from "./markdown";

/** Long-form text in the app's reading style. */
export function Prose({ children }: { children: React.ReactNode }) {
  return <div className={`${proseClass} prose-lg sm:prose-xl`}>{children}</div>;
}

/**
 * A Bible passage (KJV) with its reference underneath. Set smaller than the
 * lesson text so the teaching, not the quote, carries the page.
 */
export function Scripture({ cite, children }: { cite: string; children: React.ReactNode }) {
  return (
    <figure className="not-prose relative my-5 overflow-hidden first:mt-0 rounded-xl border border-amber-300/15 bg-amber-400/[0.05] py-3.5 pr-4 pl-5 sm:pr-5">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-amber-400/60" />
      <blockquote className="font-display text-[15px] leading-relaxed text-slate-200 sm:text-base">
        {children}
      </blockquote>
      <figcaption className="mt-1.5 text-xs font-medium text-amber-200/90">
        {cite} <span className="text-slate-500">· KJV</span>
      </figcaption>
    </figure>
  );
}

const CALLOUT_TONES = {
  gold: "border-amber-400/25 bg-amber-400/[0.06] [--label:var(--color-amber-300)]",
  sky: "border-sky-400/25 bg-sky-400/[0.06] [--label:var(--color-sky-300)]",
  violet: "border-violet-400/25 bg-violet-400/[0.06] [--label:var(--color-violet-300)]",
  emerald: "border-emerald-400/25 bg-emerald-400/[0.06] [--label:var(--color-emerald-300)]",
} as const;

/**
 * A labeled box that stands out from the text, e.g. "Spiritual parallel".
 * Its text is the same size as the lesson text around it.
 */
export function Callout({
  label,
  tone = "gold",
  children,
}: {
  label: string;
  tone?: keyof typeof CALLOUT_TONES;
  children: React.ReactNode;
}) {
  return (
    <aside className={`not-prose my-6 rounded-2xl border p-4 sm:p-5 ${CALLOUT_TONES[tone]}`}>
      <p className="mb-1.5 text-[11px] font-bold tracking-[0.2em] text-(--label) uppercase">{label}</p>
      <div className="text-lg leading-relaxed text-slate-200 sm:text-xl [&_em]:text-slate-50 [&_strong]:text-slate-50">
        {children}
      </div>
    </aside>
  );
}

/** A numbered section of a lesson, with the passage to read. `id` is its anchor. */
export function LessonSection({
  id,
  number,
  title,
  read,
  children,
}: {
  id: string;
  number?: number;
  title: string;
  read?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-8 first:border-t-0 first:pt-0">
      <header className="not-prose mb-5 flex items-start gap-4">
        {number !== undefined && (
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-400/10 font-display text-xl font-semibold text-amber-200 ring-1 ring-amber-400/25">
            {number}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-2xl leading-tight font-semibold text-balance text-slate-50 sm:text-3xl">
            {title}
          </h2>
          {read && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-wash px-2.5 py-0.5 text-xs font-medium text-slate-300 ring-1 ring-line">
              Read: {read}
            </p>
          )}
        </div>
      </header>
      <Prose>{children}</Prose>
    </section>
  );
}
