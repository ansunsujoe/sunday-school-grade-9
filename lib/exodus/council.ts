// The characters who come to a clan leader's tent: the leaders of Israel,
// the people of the clan, and the ones the game itself speaks as.

export type Persona = { name: string; title: string };

/** Speaks for manna, hunger, and the start of the journey. */
export const MOSES: Persona = { name: "Moses", title: "Prophet and leader of Israel" };
/** Brings the camp news. */
export const JOSHUA: Persona = { name: "Joshua", title: "Son of Nun, Moses' aide" };
/** Reports changes to a clan's supplies. */
export const SCRIBE: Persona = { name: "The Scribe", title: "Keeper of the camp's tally" };

/**
 * The leaders of Israel a teacher can speak as. A teacher can also speak as
 * anyone in a clan who has a role other than Villager (see raiseMatter).
 */
export const NOTABLES: Persona[] = [
  MOSES,
  { name: "Aaron", title: "High priest, Moses' brother" },
  JOSHUA,
  { name: "Nahshon", title: "Leader of the tribe of Judah" },
  { name: "Bezalel", title: "Master craftsman of the tabernacle" },
];

/** What the Scribe says when a teacher gives no reason for a change to the supplies. */
export const SCRIBE_DEFAULT_WORDS = "I have written it in the tally.";

/** How a clan member is introduced in their thread, e.g. "Shepherd of your clan". */
export const memberTitle = (role: string) => `${role} of your clan`;

/** Longest message anyone can send. */
export const MAX_WORD_LENGTH = 2000;
