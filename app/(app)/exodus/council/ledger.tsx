import { RESOURCES } from "@/lib/exodus/resources";
import { Glyph, type GlyphName } from "../ornaments";

/**
 * What a message added to or took from a clan's supplies, as a ledger line:
 * one chip per resource with its glyph, green for gains, red for losses.
 */
export function Ledger({ changes, className = "" }: { changes: Record<string, number>; className?: string }) {
  const lines = RESOURCES.filter((r) => changes[r.key]);
  if (lines.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Changes to your supplies">
      {lines.map((r) => {
        const delta = changes[r.key];
        const gain = delta > 0;
        return (
          <li
            key={r.key}
            title={`${gain ? "+" : "−"}${Math.abs(delta).toLocaleString()} ${r.unit}`}
            className={`inline-flex items-center gap-1.5 border px-2 py-1 text-sm font-semibold tabular-nums ${
              gain ? "border-emerald-400/30 text-emerald-300" : "border-rose-400/30 text-rose-300"
            }`}
          >
            <Glyph name={r.key as GlyphName} className="size-4" />
            {gain ? "+" : "−"}
            {Math.abs(delta).toLocaleString()}
            <span className="font-normal text-slate-400">{r.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
