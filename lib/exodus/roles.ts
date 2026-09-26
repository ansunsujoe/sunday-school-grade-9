// Jobs a clan member can hold. Everyone starts as a Villager; the clan leader
// (or a teacher) gives out the rest.

export const DEFAULT_ROLE = "Villager";

export const CLAN_ROLES = [
  { name: "Villager", description: "Helps wherever the clan needs hands." },
  { name: "Elder", description: "Gives wise counsel and settles disputes." },
  { name: "Priest", description: "Leads worship and offers sacrifices." },
  { name: "Levite", description: "Cares for holy things and teaches the Law." },
  { name: "Shepherd", description: "Tends the sheep and goats." },
  { name: "Herdsman", description: "Looks after the cattle and donkeys." },
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

export type ClanRole = (typeof CLAN_ROLES)[number]["name"];

export function isClanRole(value: unknown): value is ClanRole {
  return CLAN_ROLES.some((r) => r.name === value);
}
