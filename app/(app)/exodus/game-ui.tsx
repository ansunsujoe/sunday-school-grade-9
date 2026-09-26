import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import type { ClanInfo } from "@/lib/exodus/clans";
import {
  RESOURCES,
  RESOURCE_GROUPS,
  daysOfSupply,
  type ResourceInfo,
  type Resources,
} from "@/lib/exodus/resources";

/** A clan's round emblem. The source images are circles on white, so crop them to a circle. */
export function ClanLogo({ clan, className = "size-12" }: { clan: ClanInfo; className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ring-2 ${clan.accent.ring} ${className}`}>
      <Image src={clan.logo} alt={`${clan.name} emblem`} fill sizes="160px" className="scale-[1.04] object-cover" />
    </span>
  );
}

/** Logo and name on one line, e.g. in lists of answers. */
export function ClanTag({ clan, href }: { clan: ClanInfo; href?: string }) {
  const inner = (
    <>
      <ClanLogo clan={clan} className="size-7 ring-1" />
      <span className="font-medium text-slate-100">{clan.name}</span>
    </>
  );
  return href ? (
    <Link href={href} className="inline-flex items-center gap-2 hover:underline">
      {inner}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-2">{inner}</span>
  );
}

/** The big banner at the top of a clan's page. */
export function ClanHero({
  clan,
  leader,
  people,
  children,
}: {
  clan: ClanInfo;
  leader: string | null;
  people: number;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-linear-to-br from-night-800 via-night-900 to-night-950 p-5 shadow-2xl shadow-black/30 sm:p-7">
      <div className={`pointer-events-none absolute -top-24 -left-16 size-72 rounded-full blur-3xl ${clan.accent.glow}`} />
      <div className="relative flex flex-wrap items-center gap-4 sm:gap-6">
        <ClanLogo clan={clan} className="size-20 sm:size-28" />
        <div className="min-w-48 flex-1">
          <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${clan.accent.text}`}>
            The Exodus · Clan of the {clan.animal}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            {clan.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {leader ? `Led by ${leader}` : "No leader yet"} · {people.toLocaleString()}{" "}
            {people === 1 ? "person" : "people"}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

function supplyTone(days: number | null) {
  if (days === null) return { bar: "bg-slate-500", text: "text-slate-400" };
  if (days >= 14) return { bar: "bg-emerald-400", text: "text-emerald-300" };
  if (days >= 7) return { bar: "bg-amber-400", text: "text-amber-300" };
  return { bar: "bg-rose-400", text: "text-rose-300" };
}

/** A thin bar filled to `pct` percent. */
function Meter({ pct, className }: { pct: number; className: string }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
    </div>
  );
}

function ResourceTile({ r, amount, people }: { r: ResourceInfo; amount: number; people: number }) {
  // Food and water are read as "how long will this last?", so show days, not just a count.
  const days = r.key === "food" || r.key === "water" ? daysOfSupply(amount, people) : undefined;
  const tone = supplyTone(days ?? null);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 sm:p-4" title={r.hint}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-slate-400">{r.label}</span>
        <span className="text-xl leading-none" aria-hidden>
          {r.emoji}
        </span>
      </div>
      <div className="mt-1 font-display text-2xl font-semibold text-slate-50 tabular-nums sm:text-3xl">
        {amount.toLocaleString()}
        <span className="ml-1.5 font-sans text-xs font-normal text-slate-500">{r.unit}</span>
      </div>
      {days !== undefined && (
        <>
          <Meter pct={((days ?? 0) / 30) * 100} className={tone.bar} />
          <p className={`mt-1.5 text-xs ${tone.text}`}>
            {days === null ? "No one to feed" : `Lasts ${days.toLocaleString()} ${days === 1 ? "day" : "days"}`}
          </p>
        </>
      )}
      {r.key === "morale" && (
        <Meter
          pct={amount}
          className={amount >= 60 ? "bg-emerald-400" : amount >= 35 ? "bg-amber-400" : "bg-rose-400"}
        />
      )}
    </div>
  );
}

/** Everything a clan owns, grouped (treasury, food & water, herds, camp). */
export function ResourcePanel({ resources, people }: { resources: Resources; people: number }) {
  return (
    <div className="space-y-5">
      {RESOURCE_GROUPS.map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">{group.label}</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {RESOURCES.filter((r) => r.group === group.key).map((r) => (
              <ResourceTile key={r.key} r={r} amount={resources[r.key]} people={people} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A row of the most important amounts, for the clan cards on the overview. */
export function ResourceSummary({ resources, people }: { resources: Resources; people: number }) {
  const food = daysOfSupply(resources.food, people);
  const water = daysOfSupply(resources.water, people);
  const items = [
    { emoji: "🪙", label: "Gold", value: resources.gold.toLocaleString() },
    { emoji: "🍞", label: "Food", value: food === null ? "—" : `${food}d`, tone: supplyTone(food).text },
    { emoji: "💧", label: "Water", value: water === null ? "—" : `${water}d`, tone: supplyTone(water).text },
    { emoji: "🐑", label: "Sheep", value: resources.sheep.toLocaleString() },
    { emoji: "🔥", label: "Morale", value: `${resources.morale}` },
  ];
  return (
    <dl className="grid grid-cols-5 gap-1 rounded-xl bg-white/[0.03] p-2 text-center">
      {items.map((i) => (
        <div key={i.label} title={i.label}>
          <dt className="text-base leading-none" aria-label={i.label}>
            {i.emoji}
          </dt>
          <dd className={`mt-1 text-sm font-semibold tabular-nums ${i.tone ?? "text-slate-100"}`}>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100">
      <Icon name="arrowLeft" className="size-4" /> {children}
    </Link>
  );
}
