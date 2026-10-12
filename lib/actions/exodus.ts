"use server";

import { and, eq, inArray, isNull, lt, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import rosters from "@/data/exodus-rosters.json";
import { requireTeacher } from "@/lib/dal";
import { db } from "@/lib/db";
import { clanMembers, clans, councilMessages, councilThreads, gameNews, users } from "@/lib/db/schema";
import { CLANS, CLAN_SLUGS, clanInfo, isClanSlug, type ClanSlug } from "@/lib/exodus/clans";
import { addDays, formatGameDay, gameDay, portionDays } from "@/lib/exodus/manna";
import {
  JOSHUA,
  MAX_WORD_LENGTH,
  MOSES,
  NOTABLES,
  SCRIBE,
  SCRIBE_DEFAULT_WORDS,
  memberTitle,
  type Persona,
} from "@/lib/exodus/council";
import { canSeeClan, getPlayer } from "@/lib/exodus/queries";
import {
  RESOURCES,
  applyChanges,
  startingResources,
  withDefaults,
  type Resources,
} from "@/lib/exodus/resources";
import { DEFAULT_ROLE, cleanRole } from "@/lib/exodus/roles";
import { getBaker } from "@/lib/exodus/baker";
import { say } from "@/lib/exodus/say";
import type { FormState } from "./types";

// The council's unread badge lives in the game's layout, so refresh the whole game.
const revalidateGame = () => revalidatePath("/exodus", "layout");

/** Clan slugs picked in a form's "clans" checkboxes, in CLANS order. */
function readClans(formData: FormData) {
  const picked = new Set(formData.getAll("clans").map(String));
  return CLAN_SLUGS.filter((slug) => picked.has(slug));
}

async function existingClans() {
  return (await db.select({ slug: clans.slug }).from(clans)).map((c) => c.slug).filter(isClanSlug);
}

// --- Setup -----------------------------------------------------------------

/**
 * Creates any clans that don't exist yet, fills them with their starting
 * roster, and makes the student whose first name matches the clan's founder
 * its leader.
 */
export async function setUpGame() {
  await requireTeacher();
  const have = new Set(await existingClans());
  const missing = CLANS.filter((c) => !have.has(c.slug));
  if (missing.length > 0) {
    const students = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.role, "student"));
    const taken = new Set(
      (await db.select({ id: clans.leaderId }).from(clans)).map((c) => c.id).filter((id) => id !== null),
    );
    const firstName = (name: string) => name.trim().split(/\s+/)[0].toLowerCase();

    await db.insert(clans).values(
      missing.map((c) => {
        const leader = students.find((s) => !taken.has(s.id) && firstName(s.name) === c.founder.toLowerCase());
        if (leader) taken.add(leader.id);
        const people = (rosters as Record<string, string[]>)[c.slug].length;
        return { slug: c.slug, leaderId: leader?.id ?? null, resources: startingResources(people) };
      }),
    );
    const people = missing.flatMap((c) =>
      (rosters as Record<string, string[]>)[c.slug].map((name) => ({ clanSlug: c.slug, name, role: DEFAULT_ROLE })),
    );
    if (people.length > 0) await db.insert(clanMembers).values(people);
    // Each clan needs a baker to come to the leader about the manna.
    for (const c of missing) await getBaker(c.slug);
    await say(
      missing.map((c) => c.slug),
      MOSES,
      {
        body: "Your clan sets out from Egypt, and you lead it now. Look after your people and keep them fed and watered. Many will come to your tent with matters to settle; hear them out, and answer them well.",
      },
    );
  }
  revalidateGame();
  redirect("/exodus");
}

export async function setClanLeader(formData: FormData) {
  await requireTeacher();
  const slug = String(formData.get("slug"));
  const raw = String(formData.get("leaderId") ?? "");
  const leaderId = raw ? Number(raw) : null;
  if (!isClanSlug(slug) || (leaderId !== null && !Number.isInteger(leaderId))) return;

  // A student leads at most one clan, so take them off any other clan first.
  if (leaderId !== null) await db.update(clans).set({ leaderId: null }).where(eq(clans.leaderId, leaderId));
  await db.update(clans).set({ leaderId }).where(eq(clans.slug, slug));
  revalidateGame();
}

// --- Clan members ----------------------------------------------------------

/** Changes a member's role to whatever the teacher typed. Only teachers may do this. */
export async function setMemberRole(memberId: number, role: string) {
  await requireTeacher();
  if (!Number.isInteger(memberId)) return;
  const [member] = await db
    .update(clanMembers)
    .set({ role: cleanRole(role) })
    .where(eq(clanMembers.id, memberId))
    .returning({ clanSlug: clanMembers.clanSlug });
  if (member) revalidatePath(`/exodus/clans/${member.clanSlug}`);
}

export async function addMember(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "").trim();
  const role = cleanRole(formData.get("role"));
  if (!isClanSlug(slug)) return { error: "Unknown clan." };
  if (!name) return { error: "Enter a name." };

  await db.insert(clanMembers).values({ clanSlug: slug, name, role });
  revalidateGame();
  return { success: `${name} joined the ${clanInfo(slug).name}.` };
}

export async function removeMember(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const [removed] = await db
    .delete(clanMembers)
    .where(eq(clanMembers.id, id))
    .returning({ clanSlug: clanMembers.clanSlug });
  if (removed) revalidatePath(`/exodus/clans/${removed.clanSlug}`);
}

// --- Resources -------------------------------------------------------------

/**
 * Adds to or takes from resources for one or more clans. Someone tells each
 * clan about it in the council: the Scribe by default, or whoever the teacher
 * picked to deliver it (in which case the Scribe still records it, so the
 * Scribe's conversation stays a complete record of the books). Each clan is
 * told what actually changed for it, since nothing goes below zero.
 */
export async function adjustResources(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const targets = readClans(formData);
  const words = String(formData.get("reason") ?? "").trim().slice(0, MAX_WORD_LENGTH);

  const changes: Resources = {};
  for (const r of RESOURCES) {
    const raw = String(formData.get(`d_${r.key}`) ?? "").trim();
    if (!raw) continue;
    const delta = Number(raw);
    if (!Number.isInteger(delta)) return { error: `${r.label} must be a whole number.` };
    if (delta !== 0) changes[r.key] = delta;
  }

  if (targets.length === 0) return { error: "Pick at least one clan." };
  if (Object.keys(changes).length === 0) return { error: "Enter at least one change." };
  const speaker = await readSpeaker(String(formData.get("speaker") ?? "scribe:"), targets);
  if (!speaker) return { error: "Pick who delivers it. Someone from a clan can only speak to their own clan." };
  const byScribe = speaker.name === SCRIBE.name;
  if (!byScribe && !words) return { error: `Write what ${speaker.name} says.` };

  const rows = await db.select().from(clans).where(inArray(clans.slug, targets));
  for (const row of rows) {
    if (!isClanSlug(row.slug)) continue;
    const before = withDefaults(row.resources);
    const after = applyChanges(before, changes);
    await db.update(clans).set({ resources: after }).where(eq(clans.slug, row.slug));

    const actual = Object.fromEntries(
      Object.keys(changes)
        .map((key) => [key, after[key] - before[key]] as const)
        .filter(([, delta]) => delta !== 0),
    );
    if (Object.keys(actual).length === 0) continue;
    if (!byScribe) await say([row.slug], speaker, { body: words, changes: actual, authorId: user.id });
    await say([row.slug], SCRIBE, {
      kind: "notice",
      body: byScribe ? words || SCRIBE_DEFAULT_WORDS : `Delivered by ${speaker.name}.`,
      changes: actual,
      href: "/exodus#supplies",
    });
  }
  revalidateGame();
  const who = rows.length === CLAN_SLUGS.length ? "every clan" : rows.map((r) => clanInfo(r.slug).name).join(", ");
  return { success: `Updated ${who}${byScribe ? "" : `; ${speaker.name} told them`}.` };
}

// --- Manna -----------------------------------------------------------------

/**
 * Gathers today's manna for a clan: one day's food for everyone, or two on
 * Saturday. A leader gathers for their own clan; a teacher can gather for any
 * clan (e.g. when its leader is away), even on the Sabbath, and the clan is told.
 */
export async function gatherManna(formData: FormData) {
  const player = await getPlayer();
  const slug = player.isTeacher ? String(formData.get("slug")) : player.clan;
  if (!isClanSlug(slug)) return;

  const today = gameDay();
  // No manna falls on the Sabbath, but a teacher can still feed a clan that missed Saturday.
  const days = portionDays(today) || (player.isTeacher ? 1 : 0);
  if (days === 0) return;
  const fedThrough = addDays(today, days - 1);
  const [gathered] = await db
    .update(clans)
    .set({ fedThrough })
    .where(and(eq(clans.slug, slug), or(isNull(clans.fedThrough), lt(clans.fedThrough, today))))
    .returning({ slug: clans.slug });

  // The baker answers: thanks to the leader, or word that the elders stepped in.
  const baker = gathered ? await getBaker(slug) : null;
  if (baker) {
    await say([slug], baker, {
      kind: player.isTeacher ? "notice" : "word",
      body: player.isTeacher
        ? `The elders collected the manna for us. There is bread through ${formatGameDay(fedThrough)}.`
        : days === 2
          ? "Thank you, my lord. Two days' manna is in, and I will bake for today and the Sabbath."
          : "Thank you, my lord. The manna is in, and the bread will be ready by evening.",
    });
  }
  revalidatePath("/", "layout");
}

// --- Council ---------------------------------------------------------------

/**
 * Works out who a teacher picked to speak: the Scribe ("scribe:"), one of the
 * leaders of Israel ("notable:Moses"), or someone with a role in the one clan
 * the message goes to ("member:42"). Null if the pick isn't allowed.
 */
async function readSpeaker(raw: string, targets: ClanSlug[]): Promise<Persona | null> {
  const [kind, value] = [raw.slice(0, raw.indexOf(":")), raw.slice(raw.indexOf(":") + 1)];
  if (kind === "scribe") return SCRIBE;
  if (kind === "notable") return NOTABLES.find((p) => p.name === value) ?? null;
  if (kind !== "member" || targets.length !== 1) return null;
  const [member] = await db
    .select({ name: clanMembers.name, role: clanMembers.role })
    .from(clanMembers)
    .where(and(eq(clanMembers.id, Number(value)), eq(clanMembers.clanSlug, targets[0])));
  if (!member || member.role === DEFAULT_ROLE) return null;
  return { name: member.name, title: memberTitle(member.role) };
}

/**
 * A teacher, speaking as one of the leaders of Israel or someone from the
 * clan, raises a matter. Each clan's leader gets it in that person's thread.
 */
export async function raiseMatter(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const available = new Set(await existingClans());
  const targets = readClans(formData).filter((slug) => available.has(slug));
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_WORD_LENGTH);

  if (targets.length === 0) return { error: "Pick at least one clan." };
  const speaker = await readSpeaker(String(formData.get("speaker") ?? ""), targets);
  if (!speaker) {
    return {
      error:
        targets.length === 1
          ? "Pick who is speaking."
          : "Pick who is speaking. Only the leaders of Israel can speak to more than one clan.",
    };
  }
  if (!body) return { error: "Write what they say." };

  const ids = await say(targets, speaker, { body, authorId: user.id });
  revalidateGame();
  redirect(ids.length === 1 ? `/exodus/council/${ids[0]}` : "/exodus/council");
}

/**
 * Adds a message to a thread: a leader answering for their clan, or a teacher
 * answering as the thread's character. Sending also marks the thread read for
 * the sender.
 */
export async function sendWord(threadId: number, text: string): Promise<FormState> {
  const player = await getPlayer();
  const body = text.trim().slice(0, MAX_WORD_LENGTH);
  if (!body) return { error: "Write something first." };
  const [thread] = await db.select().from(councilThreads).where(eq(councilThreads.id, threadId));
  if (!thread || !canSeeClan(player, thread.clanSlug)) return { error: "That conversation is gone." };

  const now = new Date();
  await db
    .insert(councilMessages)
    .values({ threadId, fromLeader: !player.isTeacher, body, authorId: player.user.id, createdAt: now });
  await db
    .update(councilThreads)
    .set(player.isTeacher ? { lastMessageAt: now, teacherReadAt: now } : { lastMessageAt: now, leaderReadAt: now })
    .where(eq(councilThreads.id, threadId));
  revalidateGame();
  return { success: "Sent." };
}

/** Marks a thread read for whoever is looking at it. */
export async function markThreadRead(threadId: number) {
  const player = await getPlayer();
  const [thread] = await db
    .select({ clanSlug: councilThreads.clanSlug })
    .from(councilThreads)
    .where(eq(councilThreads.id, threadId));
  if (!thread || !canSeeClan(player, thread.clanSlug)) return;
  await db
    .update(councilThreads)
    .set(player.isTeacher ? { teacherReadAt: new Date() } : { leaderReadAt: new Date() })
    .where(eq(councilThreads.id, threadId));
  revalidateGame();
}

export async function deleteThread(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await db.delete(councilThreads).where(eq(councilThreads.id, id));
  revalidateGame();
  redirect("/exodus/council");
}

// --- News ------------------------------------------------------------------

function readNews(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
  };
}

function validateNews(news: ReturnType<typeof readNews>) {
  if (!news.title) return "Give the article a title.";
  if (!news.content) return "Write the article.";
  return null;
}

export async function createNews(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireTeacher();
  const news = readNews(formData);
  const error = validateNews(news);
  if (error) return { error };

  const [{ id }] = await db
    .insert(gameNews)
    .values({ ...news, authorId: user.id })
    .returning({ id: gameNews.id });
  await say(await existingClans(), JOSHUA, {
    kind: "notice",
    body: `News from the camp: “${news.title}”`,
    href: `/exodus/news/${id}`,
  });
  revalidateGame();
  redirect("/exodus/news");
}

export async function updateNews(_: FormState, formData: FormData): Promise<FormState> {
  await requireTeacher();
  const id = Number(formData.get("id"));
  const news = readNews(formData);
  const error = validateNews(news);
  if (error) return { error };

  await db
    .update(gameNews)
    .set({ ...news, updatedAt: new Date() })
    .where(eq(gameNews.id, id));
  revalidateGame();
  redirect(`/exodus/news/${id}`);
}

export async function deleteNews(formData: FormData) {
  await requireTeacher();
  const id = Number(formData.get("id"));
  await db.delete(gameNews).where(eq(gameNews.id, id));
  await db.delete(councilMessages).where(eq(councilMessages.href, `/exodus/news/${id}`));
  revalidateGame();
  redirect("/exodus/news");
}
