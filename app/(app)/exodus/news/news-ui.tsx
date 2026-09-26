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
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-amber-300 to-amber-500 font-semibold text-night-950 ${
          size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs"
        }`}
        aria-hidden
      >
        JN
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
