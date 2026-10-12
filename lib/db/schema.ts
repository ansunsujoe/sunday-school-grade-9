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

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  // Slug of the content item this quiz goes with (see lib/content.ts).
  lessonSlug: text("lesson_slug"),
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

// Posted by teachers, read by everyone. `body` is Markdown.
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// One row per user per announcement they have seen; no row means unread.
export const announcementReads = pgTable(
  "announcement_reads",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: integer("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.announcementId] })],
);

// Anonymous questions from students to teachers. Nothing about who asked is
// stored, on purpose; teachers remove questions once they've been answered.
export const questionBox = pgTable("question_box", {
  id: serial("id").primaryKey(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The memory verse (KJV), one per Sunday at most. A verse stays up from its
// Sunday until the next one in the schedule.
export const memoryVerses = pgTable("memory_verses", {
  id: serial("id").primaryKey(),
  sunday: date("sunday").notNull().unique(),
  reference: text("reference").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MemoryVerse = typeof memoryVerses.$inferSelect;

export type Role = (typeof roleEnum.enumValues)[number];

// ---------------------------------------------------------------------------
// The Exodus: a role-playing game. Clan definitions (names, logos, resource
// types) live in lib/exodus; these tables hold the game's changing state.

// One row per clan. Each clan is led by one student; teachers see every clan.
// `resources` maps a resource key from lib/exodus/resources.ts to an amount.
export const clans = pgTable("clans", {
  slug: text("slug").primaryKey(),
  leaderId: integer("leader_id")
    .unique()
    .references(() => users.id, { onDelete: "set null" }),
  resources: jsonb("resources").$type<Record<string, number>>().notNull(),
  // Daily manna (see lib/exodus/manna.ts), as Central-time dates. `fedThrough`
  // is the last day the clan has food for; `judgedThrough` is the last day
  // whose hunger has been settled. Both start empty until the manna begins.
  fedThrough: date("fed_through"),
  judgedThrough: date("judged_through"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The people of a clan. `role` is free text a teacher writes (see lib/exodus/roles.ts).
export const clanMembers = pgTable("clan_members", {
  id: serial("id").primaryKey(),
  clanSlug: text("clan_slug")
    .notNull()
    .references(() => clans.slug, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull().default("Villager"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// News of the camp, posted by teachers and read by every clan. `content` is Markdown.
export const gameNews = pgTable("game_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// The council: people who come to a clan leader's tent with matters to settle.
// Each thread is one character (played by a teacher, or the game itself)
// talking with one clan's leader. `persona` names the character; a clan has
// at most one thread per character. Read times drive the unread counts.
export const councilThreads = pgTable(
  "council_threads",
  {
    id: serial("id").primaryKey(),
    clanSlug: text("clan_slug")
      .notNull()
      .references(() => clans.slug, { onDelete: "cascade" }),
    persona: text("persona").notNull(),
    personaTitle: text("persona_title"),
    lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
    leaderReadAt: timestamp("leader_read_at"),
    teacherReadAt: timestamp("teacher_read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.clanSlug, t.persona)],
);

export const COUNCIL_MESSAGE_KINDS = ["word", "notice"] as const;
export type CouncilMessageKind = (typeof COUNCIL_MESSAGE_KINDS)[number];

// One message in a thread: from the leader, or from the thread's character.
// A "notice" is sent by the game itself (manna, hunger, supplies, news) and
// may link somewhere with `href`. `changes` holds what a message added to or
// took from the clan's supplies (resource key -> amount), shown as a ledger.
export const councilMessages = pgTable("council_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id")
    .notNull()
    .references(() => councilThreads.id, { onDelete: "cascade" }),
  fromLeader: boolean("from_leader").notNull(),
  kind: text("kind").$type<CouncilMessageKind>().notNull().default("word"),
  body: text("body").notNull(),
  href: text("href"),
  changes: jsonb("changes").$type<Record<string, number>>(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
