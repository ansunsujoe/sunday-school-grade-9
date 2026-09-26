import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  time,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["teacher", "student"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const CONTENT_KINDS = ["lesson", "supplementary"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

// Shown in the app as "Content". Each item is a page written on the site
// (`body`, in Markdown), a link to material elsewhere (`url`), or both.
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").$type<ContentKind>().notNull().default("lesson"),
  url: text("url"),
  body: text("body"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  lessonId: integer("lesson_id").references(() => lessons.id, {
    onDelete: "set null",
  }),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  prompt: text("prompt").notNull(),
  choices: jsonb("choices").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
});

export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Maps question id -> chosen choice index.
    answers: jsonb("answers").$type<Record<string, number>>().notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.quizId, t.studentId)],
);

// One row per student per Sunday. Every grade column is nullable so the
// teacher can leave slots blank and fill them in later.
export const weeklyGrades = pgTable(
  "weekly_grades",
  {
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    present: boolean("present"),
    memoryVerse: integer("memory_verse"),
    quiz: integer("quiz"),
    sermonNotes: boolean("sermon_notes"),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.date] })],
);

export const EVENT_AUDIENCES = ["all", "teachers"] as const;
export type EventAudience = (typeof EVENT_AUDIENCES)[number];

// Calendar events. "all" events are seen by teachers and students; "teachers"
// events only by teachers. Times are optional, for all-day events.
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: date("date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  audience: text("audience").$type<EventAudience>().notNull().default("all"),
  noSundaySchool: boolean("no_sunday_school").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CalendarEvent = typeof events.$inferSelect;

export type Role = (typeof roleEnum.enumValues)[number];
