import { gatherManna } from "@/lib/actions/exodus";
import { HUNGER_DEATHS, formatGameDay, isSabbath, type MannaStatus } from "@/lib/exodus/manna";
import { GatherButton, MannaCountdown } from "./manna-clock";
import { Glyph } from "./ornaments";

/**
 * The clan's food, at the top of its supplies: whether today's manna is in,
 * how long until it runs out (or until the day's hunger is judged), and the
 * button to collect it. The leader collects for their own clan; a teacher can
 * collect for any clan, even on the Sabbath when a clan missed Saturday.
 */
export function MannaSupply({
  slug,
  status,
  people,
  as,
}: {
  slug: string;
  status: MannaStatus;
  people: number;
  as: "leader" | "teacher";
}) {
  const sabbath = isSabbath(status.today);
  const double = status.portion === 2;
  const teacherRescue = as === "teacher" && !status.fed && sabbath;
  const canCollect = status.canGather || teacherRescue;

  const label = status.fed
    ? "Collected"
    : sabbath && !teacherRescue
      ? "No manna on the Sabbath"
      : as === "teacher"
        ? teacherRescue
          ? "Feed this clan anyway"
          : "Collect for this clan"
        : double
          ? "Collect a double portion"
          : "Collect manna";

  const tone = status.fed ? "text-emerald-300" : status.canGather ? "text-amber-300" : "text-rose-300";
  const edge = status.fed ? "bg-emerald-400/70" : status.canGather ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="relative mb-4 overflow-hidden border border-line-subtle bg-night-900/50 p-4 pl-5 sm:p-5 sm:pl-6">
      {/* A thin edge in the day's status color is the only highlight. */}
      <span className={`absolute inset-y-0 left-0 w-1 ${edge}`} aria-hidden />
      <Glyph
        name="manna"
        className="pointer-events-none absolute -right-4 -bottom-8 size-36 text-slate-400 opacity-[0.05]"
      />
      <h3 className="relative font-display text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
        Food · Manna
      </h3>
      <div className="relative mt-2 flex flex-wrap items-center gap-x-4 gap-y-3">
        <Glyph name="manna" className={`size-9 shrink-0 ${tone}`} />
        <div className="min-w-52 flex-1">
          <p className={`font-display text-lg font-semibold ${status.fed ? "text-slate-50" : tone}`}>
            {status.fed
              ? `Manna collected · bread through ${formatGameDay(status.fedThrough!)}`
              : status.canGather
                ? double
                  ? "Today's manna is waiting · collect two days' worth"
                  : "Today's manna is waiting"
                : "No food for the Sabbath"}
          </p>
          <p className="mt-0.5 text-sm text-slate-400">
            {status.fed ? (
              <>
                {status.rations.toLocaleString()} rations for {people.toLocaleString()} people · runs out in{" "}
                <MannaCountdown deadline={status.deadline} now={status.now} className="text-slate-200" />, at midnight
                Central
              </>
            ) : (
              <>
                <MannaCountdown deadline={status.deadline} now={status.now} className="font-semibold text-rose-300" />{" "}
                left before midnight Central, or {HUNGER_DEATHS} people die
              </>
            )}
          </p>
        </div>
        <form action={gatherManna}>
          <input type="hidden" name="slug" value={slug} />
          <GatherButton label={label} disabled={!canCollect} />
        </form>
      </div>
    </div>
  );
}
