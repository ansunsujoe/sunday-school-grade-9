// Jobs a clan member can hold. Everyone starts as a Villager; teachers write in
// the rest. A role can be anything; CLAN_ROLES are only suggestions.

export const DEFAULT_ROLE = "Villager";

/** Each clan has one; they come to the leader's tent about the manna (see lib/exodus/baker.ts). */
export const BAKER_ROLE = "Baker";

export const CLAN_ROLES = [
  { name: "Villager", description: "Helps wherever the clan needs hands." },
  { name: "Elder", description: "Gives wise counsel and settles disputes." },
  { name: "Priest", description: "Leads worship and offers sacrifices." },
  { name: "Levite", description: "Cares for holy things and teaches the Law." },
  { name: "Shepherd", description: "Tends the sheep and goats." },
  { name: "Herdsman", description: "Looks after the cattle and donkeys." },
  { name: "Baker", description: "Grinds and bakes the manna into cakes (Numbers 11:8)." },
  { name: "Gatherer", description: "Collects manna each morning and finds food." },
  { name: "Water Bearer", description: "Draws water and digs wells." },
  { name: "Warrior", description: "Guards the camp and fights raiders." },
  { name: "Scout", description: "Goes ahead to find the way, water, and danger." },
  { name: "Craftsman", description: "Builds, weaves, and works metal and wood." },
  { name: "Healer", description: "Tends the sick and helps with births." },
  { name: "Musician", description: "Leads songs and lifts the clan's spirit." },
  { name: "Scribe", description: "Keeps the clan's records and counts." },
  { name: "Trader", description: "Bargains with other clans and merchants." },
] as const;

/** Longest role a teacher can type. */
export const MAX_ROLE_LENGTH = 40;

/** A typed role tidied up: trimmed, single-spaced, cut to length. Blank means Villager. */
export function cleanRole(value: unknown) {
  const role = String(value ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_ROLE_LENGTH);
  return role || DEFAULT_ROLE;
}
