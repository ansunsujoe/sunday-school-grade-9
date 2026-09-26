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
