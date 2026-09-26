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
