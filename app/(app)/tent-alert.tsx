import Link from "next/link";
import { HUNGER_DEATHS, isSabbath } from "@/lib/exodus/manna";
import { getPlayer, getTentAlert, type TentAlert as Alert } from "@/lib/exodus/queries";
import { PersonaSeal } from "./exodus/council/council-ui";
import { MannaCountdown } from "./exodus/manna-clock";
import { TentAlertShell } from "./tent-alert-shell";

/** "Asher", "Asher and Moses", "Asher, Moses, and 2 others". */
function whoIsWaiting(names: string[]) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const others = names.length - 2;
  return `${names[0]}, ${names[1]}, and ${others} ${others === 1 ? "other" : "others"}`;
}

/**
 * A strip under the header on every page, so a leader sees at once when their
 * clan needs them: who is waiting at their tent, and whether the manna is
 * still uncollected. Teachers see when leaders have answered.
 */
export async function TentAlert() {
  const alert = await getTentAlert(await getPlayer());
  return alert ? <TentAlertView alert={alert} /> : null;
}

export function TentAlertView({ alert }: { alert: Alert }) {
  const names = alert.waiting.map((t) => t.persona);
  const tent =
    alert.waiting.length === 1 ? `/exodus/council/${alert.waiting[0].id}` : "/exodus/council";

  let headline: string;
  let detail: React.ReactNode;
  let href: string;
  let action: string;
  // Pages that already show this, where the banner would only repeat it.
  const hideUnder = ["/exodus/council"];
  const hideAt: string[] = [];

  if (alert.side === "teacher") {
    headline = `${alert.unread} new ${alert.unread === 1 ? "answer" : "answers"} at the tents`;
    detail = `Leaders of ${alert.clans} ${alert.clans === 1 ? "clan" : "clans"} answered ${whoIsWaiting(names)}.`;
    href = tent;
    action = "Open the council";
  } else {
    const manna = alert.manna;
    headline = "Your clan needs you";
    detail = (
      <>
        {names.length > 0 && (
          <>
            {whoIsWaiting(names)} {names.length === 1 ? "is" : "are"} waiting at your tent.
          </>
        )}
        {names.length > 0 && manna && " "}
        {manna && (
          <span className="text-rose-300">
            {isSabbath(manna.today) && !manna.canGather ? (
              `There is no food today; ${HUNGER_DEATHS} people will die at midnight.`
            ) : (
              <>
                Today&apos;s manna isn&apos;t collected:{" "}
                <MannaCountdown deadline={manna.deadline} now={manna.now} className="font-semibold" /> left.
              </>
            )}
          </span>
        )}
      </>
    );
    if (names.length > 0) {
      href = tent;
      action = "Go to your tent";
    } else {
      href = "/exodus#supplies";
      action = "Collect manna";
      hideAt.push("/exodus");
    }
  }

  const signature = [
    alert.side,
    alert.unread,
    alert.waiting.map((t) => t.id).join("."),
    alert.side === "leader" && alert.manna ? alert.manna.today : "",
  ].join(":");

  return (
    <TentAlertShell signature={signature} hideUnder={hideUnder} hideAt={hideAt}>
      <div className="ex-scope relative overflow-hidden border-b border-[var(--ex-rule)] bg-night-900">
        {/* A gold edge and a slow pulse: the only highlight, so it reads as a call, not decoration. */}
        <span className="absolute inset-y-0 left-0 w-1 bg-amber-400" aria-hidden />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 pr-12 pl-5 sm:pl-6 lg:pr-14">
          <span className="relative flex size-2.5 shrink-0" aria-hidden>
            <span className="absolute inset-0 rounded-full bg-amber-400 opacity-70 motion-safe:animate-ping" />
            <span className="relative size-2.5 rounded-full bg-amber-400" />
          </span>
          {names.length > 0 && (
            <span className="hidden shrink-0 -space-x-2 sm:flex">
              {alert.waiting.slice(0, 3).map((t) => (
                <PersonaSeal key={t.id} name={t.persona} size="sm" />
              ))}
            </span>
          )}
          {/* On phones the words take the whole row and the button drops below them. */}
          <p className="min-w-0 flex-1 basis-[calc(100%-2rem)] text-sm text-slate-300 sm:basis-0">
            <span className="mr-2 font-display font-semibold text-slate-50">{headline}.</span>
            {detail}
          </p>
          <Link
            href={href}
            className="ml-6.5 inline-flex min-h-9 shrink-0 items-center bg-amber-400 px-3.5 text-sm font-semibold text-ink transition hover:brightness-110 sm:ml-0"
          >
            {action} →
          </Link>
        </div>
      </div>
    </TentAlertShell>
  );
}
