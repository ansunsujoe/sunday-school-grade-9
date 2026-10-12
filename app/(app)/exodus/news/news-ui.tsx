import { formatDateTime } from "@/lib/format";

/** Every article is written by Joshua, son of Nun (Exodus 33:11), whoever posts it. */
export const NEWS_AUTHOR = "Joshua Nun";

/** Rough minutes to read `text`, at about 200 words a minute. */
export function readingMinutes(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

export function Byline({ date, minutes, size = "md" }: { date: Date; minutes?: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Joshua's seal: his initials pressed in a gold diamond. */}
      <span
        className={`relative grid shrink-0 place-items-center font-display font-semibold text-[var(--ex-gold)] ${
          size === "sm" ? "size-8 text-[10px]" : "size-10 text-xs"
        }`}
        aria-hidden
      >
        <span className="absolute inset-1 rotate-45 border border-[var(--ex-gold-soft)] bg-amber-400/10" />
        <span className="relative">JN</span>
      </span>
      <div className={`leading-tight ${size === "sm" ? "text-xs" : "text-sm"}`}>
        <p className="font-medium text-slate-200">{NEWS_AUTHOR}</p>
        <p className="text-slate-500">
          <time dateTime={date.toISOString()}>{formatDateTime(date)}</time>
          {minutes !== undefined && ` · ${minutes} min read`}
        </p>
      </div>
    </div>
  );
}
