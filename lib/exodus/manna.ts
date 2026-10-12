// Daily manna (Exodus 16). Each day a clan's leader gathers one day's food for
// everyone; kept overnight it spoils, so it can't be stored up. On Saturday
// they gather a double portion, because no manna falls on Sunday, the Sabbath.
// A day ends at midnight Central time, and a clan that ate nothing that day
// loses HUNGER_DEATHS people.

/** The game's clock. Days start and end at midnight here. */
export const MANNA_TIME_ZONE = "America/Chicago";

/** People who die when a clan goes a day without food. */
export const HUNGER_DEATHS = 5;

/** A YYYY-MM-DD date in Central time. */
export type GameDay = string;

/** What day it is in Central time at `now`. */
export function gameDay(now = new Date()): GameDay {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MANNA_TIME_ZONE }).format(now);
}

export function addDays(day: GameDay, n: number): GameDay {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
function weekday(day: GameDay) {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

export const isSabbath = (day: GameDay) => weekday(day) === 0;
export const isPreparationDay = (day: GameDay) => weekday(day) === 6;

/** Days of food one gathering on `day` gives: none on the Sabbath, two on Saturday, otherwise one. */
export function portionDays(day: GameDay) {
  if (isSabbath(day)) return 0;
  return isPreparationDay(day) ? 2 : 1;
}

/** Minutes Central time is ahead of UTC at `instant` (negative: −300 or −360). */
function centralOffset(instant: number) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: MANNA_TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return Math.round((asUtc - instant) / 60_000);
}

/** The moment `day` ends: midnight Central time at the start of the next day. */
export function endOfDay(day: GameDay): Date {
  const midnightUtc = new Date(`${addDays(day, 1)}T00:00:00Z`).getTime();
  return new Date(midnightUtc - centralOffset(midnightUtc) * 60_000);
}

/** e.g. "Mon, Oct 12". */
export function formatGameDay(day: GameDay) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export type MannaStatus = {
  /** When this was worked out, as epoch milliseconds. */
  now: number;
  today: GameDay;
  /** Whether the clan has food for today. */
  fed: boolean;
  /** Whether the leader can gather right now (not fed yet, and not the Sabbath). */
  canGather: boolean;
  /** Days of food one gathering today would give. */
  portion: number;
  /** Rations on hand: one per person for each day still covered, today included. */
  rations: number;
  /** When the clan's food runs out, or (if it has none today) when today's hunger is judged. ISO string. */
  deadline: string;
  /** Last day the clan has food for, if any from today on. */
  fedThrough: GameDay | null;
};

/** Where a clan stands today, given the last day it has food for. */
export function mannaStatus(fedThrough: GameDay | null, people: number, now = new Date()): MannaStatus {
  const today = gameDay(now);
  const covered = fedThrough !== null && fedThrough >= today ? fedThrough : null;
  const days = covered ? Math.round((Date.parse(covered) - Date.parse(today)) / 86_400_000) + 1 : 0;
  return {
    now: now.getTime(),
    today,
    fed: covered !== null,
    canGather: covered === null && !isSabbath(today),
    portion: portionDays(today),
    rations: days * people,
    deadline: endOfDay(covered ?? today).toISOString(),
    fedThrough: covered,
  };
}
