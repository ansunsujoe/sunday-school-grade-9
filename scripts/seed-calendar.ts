// Loads the school-year calendar into the events table:
//   npm run seed-calendar
// Safe to re-run: events already in the database (same date and title) are skipped.
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { events, type EventAudience } from "../lib/db/schema";

config({ path: ".env.local" });

type SeedEvent = {
  date: string;
  title: string;
  audience: EventAudience;
  startTime?: string;
  endTime?: string;
};

async function main() {
  const file = new URL("../data/calendar-2026-2027.json", import.meta.url);
  const seed: SeedEvent[] = JSON.parse(readFileSync(file, "utf8")).events;

  const db = drizzle(neon(process.env.DATABASE_URL!));
  const existing = new Set(
    (await db.select({ date: events.date, title: events.title }).from(events)).map(
      (e) => `${e.date}|${e.title}`,
    ),
  );

  const rows = seed
    .filter((e) => !existing.has(`${e.date}|${e.title}`))
    .map((e) => ({
      title: e.title,
      date: e.date,
      startTime: e.startTime ?? null,
      endTime: e.endTime ?? null,
      audience: e.audience,
      noSundaySchool: /no sunday school/i.test(e.title),
    }));

  if (rows.length > 0) await db.insert(events).values(rows);
  console.log(`Added ${rows.length} events (${seed.length - rows.length} already there).`);
}

main();
