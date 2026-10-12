import { getPlayer } from "@/lib/exodus/queries";
import { Glyph } from "../ornaments";
import { CouncilFrame } from "./council-frame";

export default async function CouncilPage({ searchParams }: { searchParams: Promise<{ clan?: string }> }) {
  const player = await getPlayer();
  const { clan } = await searchParams;

  return (
    <CouncilFrame player={player} clan={clan}>
      {/* Shown beside the list on wide screens until a conversation is opened. */}
      <div className="grid flex-1 place-items-center p-10 text-center">
        <div className="max-w-md">
          <div className="relative mx-auto grid size-24 place-items-center text-[var(--ex-gold)]">
            <span className="absolute inset-4 rotate-45 border border-current opacity-40" />
            <span className="absolute inset-6 rotate-45 border border-current opacity-20" />
            <Glyph name="tents" className="relative size-10" />
          </div>
          <p className="mt-5 font-display text-xl leading-snug text-slate-200 italic">
            “Moses sat to judge the people, and the people stood by Moses from the morning unto the evening.”
          </p>
          <p className="mt-2 text-xs tracking-[0.2em] text-[var(--ex-gold)] uppercase">Exodus 18:13</p>
          <p className="mt-5 text-sm leading-6 text-slate-400">
            {player.isTeacher
              ? "Speak as anyone in the camp or beyond it. Each leader answers in their own words."
              : "People come to your tent with matters to settle. Open one to hear them out and give your answer."}
          </p>
        </div>
      </div>
    </CouncilFrame>
  );
}
