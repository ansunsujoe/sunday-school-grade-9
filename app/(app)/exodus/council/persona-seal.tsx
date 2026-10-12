import { JOSHUA, MOSES, SCRIBE } from "@/lib/exodus/council";
import { Glyph, type GlyphName } from "../ornaments";

// The characters the game speaks as get their own glyph; everyone else, their initial.
const PERSONA_GLYPHS: Record<string, GlyphName> = {
  [MOSES.name]: "tablet",
  [JOSHUA.name]: "shofar",
  [SCRIBE.name]: "scroll",
};

// Thread colors of the tabernacle, plus gold and green, picked by name so a character keeps theirs.
const PERSONA_TONES = [
  "text-[var(--ex-gold)]",
  "text-sky-300",
  "text-violet-300",
  "text-rose-300",
  "text-emerald-300",
  "text-orange-300",
];

function toneFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PERSONA_TONES[h % PERSONA_TONES.length];
}

/** A character's seal: their glyph or initial, pressed in a diamond of their color. */
export function PersonaSeal({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const box = { sm: "size-8", md: "size-11", lg: "size-14" }[size];
  const inner = { sm: "size-3.5 text-xs", md: "size-5 text-base", lg: "size-6 text-xl" }[size];
  const glyph = PERSONA_GLYPHS[name];
  const initial = name.replace(/^(the|an?)\s+/i, "").charAt(0).toUpperCase();
  return (
    <span className={`relative grid shrink-0 place-items-center ${box} ${toneFor(name)}`} aria-hidden>
      <span className="absolute inset-[15%] rotate-45 border border-current bg-current/10 opacity-60" />
      {glyph ? (
        <Glyph name={glyph} className={`relative ${inner}`} />
      ) : (
        <span className={`relative font-display leading-none font-semibold ${inner.split(" ").pop()}`}>
          {initial}
        </span>
      )}
    </span>
  );
}
