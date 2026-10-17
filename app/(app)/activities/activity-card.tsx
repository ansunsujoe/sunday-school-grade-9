import Link from "next/link";
import { CLANS } from "@/lib/exodus/clans";
import { ClanLogo } from "../exodus/game-ui";
import { Mark } from "../exodus/ornaments";

export type Stat = { label: string; value: string; tone?: "gold" };

/**
 * One game in the catalog: a picture banner (with the six clan emblems for
 * The Exodus), the name, a line about it, and a few live numbers.
 */
export function ActivityCard({
  href,
  tag,
  title,
  summary,
  art,
  alert,
  emblems,
  stats,
}: {
  href: string;
  tag: string;
  title: string;
  summary: string;
  art: React.ReactNode;
  alert?: string;
  emblems?: boolean;
  stats: Stat[];
}) {
  return (
    <Link
      href={href}
      className="group ex-panel block h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px] hover:shadow-amber-500/25 focus-visible:outline-2 focus-visible:outline-[var(--ex-gold)]"
    >
      <div className="relative h-48 overflow-hidden border-b border-[var(--ex-rule)] sm:h-56">
        <div className="size-full transition duration-[1.2s] ease-out group-hover:scale-[1.06]">{art}</div>
        {/* Fades the picture into the panel below, and keeps the tags readable. */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[var(--ex-panel)] via-transparent to-black/30" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="bg-night-950/70 backdrop-blur">
            <Mark tone="gold">{tag}</Mark>
          </span>
          {alert && (
            <span className="inline-flex items-center gap-1.5 bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-ink">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-ink opacity-60 motion-safe:animate-ping" />
                <span className="relative size-1.5 rounded-full bg-ink" />
              </span>
              {alert}
            </span>
          )}
        </div>
        {emblems && (
          <div className="absolute bottom-3 left-4 flex -space-x-2.5">
            {CLANS.map((clan, i) => (
              <span
                key={clan.slug}
                className="art-emblem transition duration-300 group-hover:-translate-y-1"
                style={{ animationDelay: `${300 + i * 70}ms`, transitionDelay: `${i * 30}ms` }}
              >
                <ClanLogo clan={clan} className="size-9 ring-2 ring-night-950 sm:size-10" />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-slate-50 sm:text-[1.7rem]">
          {title}
          <span
            aria-hidden
            className="text-[var(--ex-gold)] transition duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{summary}</p>
        <dl className="mt-5 grid grid-cols-3 border-t border-[var(--ex-rule)] pt-4">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0 border-line-subtle px-2 first:pl-0 not-first:border-l">
              <dt className="truncate text-[10px] tracking-[0.14em] text-slate-500 uppercase">{s.label}</dt>
              <dd
                className={`mt-0.5 truncate font-display text-base font-semibold sm:text-lg ${
                  s.tone === "gold" ? "text-[var(--ex-gold)]" : "text-slate-100"
                }`}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}
