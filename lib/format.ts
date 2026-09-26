// Time zone used to decide what "today" is for upcoming vs. past lessons.
const TIME_ZONE = process.env.APP_TIME_ZONE ?? "America/Chicago";

/** Today's date as YYYY-MM-DD in the class's time zone. */
export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date(),
  );
}

/** Formats a YYYY-MM-DD date string, e.g. "Sun, Sep 28, 2026". */
export function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function percent(numerator: number, denominator: number) {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

/** Formats a YYYY-MM-DD date string as a month and day, e.g. "Sep 28". */
export function formatShortDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

/** Formats a YYYY-MM-DD date string as a month and year, e.g. "September 2026". */
export function formatMonth(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

/** Formats an HH:MM[:SS] time string, e.g. "16:30:00" -> "4:30 PM". */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** A moment in the class's time zone, e.g. "Sun, Sep 27, 2026 at 9:14 AM". */
export function formatDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** How long ago `date` was, e.g. "just now", "3 hr ago", "2 days ago", or "Sep 2" past a week. */
export function timeAgo(date: Date, now = new Date()) {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { timeZone: TIME_ZONE, month: "short", day: "numeric" });
}

/** Markdown reduced to a line of plain text, for previews. */
export function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]|^\s*[-+]\s+|^\s*\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
