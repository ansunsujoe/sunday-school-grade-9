import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import type { ClanInfo } from "@/lib/exodus/clans";
import type { MannaStatus } from "@/lib/exodus/manna";
import {
  RESOURCES,
  RESOURCE_GROUPS,
  daysOfSupply,
  type ResourceInfo,
  type Resources,
} from "@/lib/exodus/resources";
import { Dunes, Glyph, type GlyphName } from "./ornaments";

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
      <span className="font-display font-semibold text-slate-100">{clan.name}</span>
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

/** The banner at the top of a clan's page: its emblem, name, and people, over the dunes. */
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
    <section className="ex-panel overflow-hidden">
      <div className={`pointer-events-none absolute -top-24 left-10 size-72 rounded-full blur-3xl ${clan.accent.glow}`} />
      <Dunes />
      <div className="relative flex flex-wrap items-center gap-5 px-5 pt-7 pb-8 sm:gap-8 sm:px-8 sm:pb-10">
        <ClanLogo clan={clan} className="size-20 sm:size-28" />
        <div className="min-w-48 flex-1">
          <p className={`font-display text-xs font-semibold tracking-[0.25em] uppercase ${clan.accent.text}`}>
            Clan of the {clan.animal}
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            {clan.name}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
            <span>{leader ? `Led by ${leader}` : "No leader yet"}</span>
            <span className="inline-flex items-center gap-1.5">
              <Glyph name="people" className="size-4 text-[var(--ex-gold)]" />
              {people.toLocaleString()} {people === 1 ? "person" : "people"}
            </span>
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

/**
 * Each thing's pictographs in a muted color of what it is made of, so the
 * storehouse isn't all gold: gold stays gold, silver is gray, water is blue,
 * the herds are earth and wool.
 */
const MATERIAL_TONES: Record<string, string> = {
  gold: "text-amber-300",
  silver: "text-slate-300",
  jewels: "text-violet-300",
  water: "text-sky-300",
  wells: "text-sky-300/70",
  sheep: "text-stone-300",
  goats: "text-stone-400",
  cattle: "text-orange-300/80",
  donkeys: "text-stone-400",
  tents: "text-stone-300",
  weapons: "text-slate-400",
  morale: "text-amber-300",
};

/** How many units one pictograph stands for, so a count fits in about ten pictures. */
function pictographStep(amount: number) {
  for (const step of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]) {
    if (Math.ceil(amount / step) <= 10) return step;
  }
  return Math.ceil(amount / 10);
}

/**
 * An amount counted out in pictures, the way a scribe might tally it: a row of
 * the resource's own glyph, each standing for `step` of them, with a faint
 * last one for any part left over.
 */
function Pictographs({ glyph, amount, unit, tone }: { glyph: GlyphName; amount: number; unit: string; tone: string }) {
  if (amount <= 0) return <p className="text-xs text-slate-500 italic">None left</p>;
  const step = pictographStep(amount);
  const whole = Math.floor(amount / step);
  const part = amount % step > 0;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className={`flex flex-wrap gap-0.5 ${tone}`} aria-hidden>
        {Array.from({ length: whole }, (_, i) => (
          <Glyph key={i} name={glyph} className="size-4" />
        ))}
        {part && <Glyph name={glyph} className="size-4 opacity-30" />}
      </div>
      {step > 1 && (
        <span className="text-[10px] tracking-wide text-slate-500 uppercase">
          each = {step.toLocaleString()} {unit}
        </span>
      )}
    </div>
  );
}

/** Days of water as notches, one per day up to a month, colored by how long it lasts. */
function DaysGauge({ days }: { days: number | null }) {
  const tone = supplyTone(days);
  const filled = Math.min(30, days ?? 0);
  return (
    <div>
      <div className="flex gap-[2px]" aria-hidden>
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className={`h-3 flex-1 ${i < filled ? tone.bar : "bg-wash-hover"} ${i % 7 === 6 ? "mr-0.5" : ""}`} />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${tone.text}`}>
        {days === null ? "No one to give it to" : `Lasts ${days.toLocaleString()} ${days === 1 ? "day" : "days"}`}
        {days !== null && days > 30 && " (more than a month)"}
      </p>
    </div>
  );
}

/** Morale as ten oil lamps, lit one for every ten points. */
function LampRow({ morale }: { morale: number }) {
  const lit = Math.round(morale / 10);
  const tone = morale >= 60 ? "text-amber-300" : morale >= 35 ? "text-orange-300" : "text-rose-300";
  return (
    <div>
      <div className="flex flex-wrap gap-0.5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <Glyph key={i} name="morale" className={`size-4 sm:size-5 ${i < lit ? tone : "text-slate-600 opacity-50"}`} />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${tone}`}>
        {morale >= 60 ? "The camp is in good heart" : morale >= 35 ? "Grumbling in the tents" : "The people are bitter"}
      </p>
    </div>
  );
}

/** One storeroom shelf: the resource's name and glyph, its amount, and a picture of how much. */
function StoreCell({ r, amount, people }: { r: ResourceInfo; amount: number; people: number }) {
  const glyph = r.key as GlyphName;
  const tone = MATERIAL_TONES[r.key] ?? "text-slate-300";
  return (
    <div className="group relative flex flex-col overflow-hidden border border-line-subtle bg-night-900/50 p-3 transition hover:border-line-strong sm:p-4">
      {/* The resource's glyph, large and faint, carved into the corner of the shelf. */}
      <Glyph
        name={glyph}
        className="pointer-events-none absolute -right-5 -bottom-5 size-32 text-slate-400 opacity-[0.05] transition group-hover:opacity-[0.09]"
      />
      <span className="relative font-display text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {r.label}
      </span>
      <p className="relative mt-2 font-display text-3xl sm:text-4xl leading-none font-semibold text-slate-50 tabular-nums">
        {amount.toLocaleString()}
        <span className="ml-1.5 inline-block font-sans text-xs font-normal whitespace-nowrap text-slate-500">{r.unit}</span>
      </p>
      <div className="relative mt-4">
        {r.key === "water" ? (
          <DaysGauge days={daysOfSupply(amount, people)} />
        ) : r.key === "morale" ? (
          <LampRow morale={amount} />
        ) : (
          <Pictographs glyph={glyph} amount={amount} unit={r.unit} tone={tone} />
        )}
      </div>
      <p className="relative mt-auto hidden pt-3 text-xs leading-5 text-slate-500 sm:block">{r.hint}</p>
    </div>
  );
}

/**
 * Everything a clan owns, as a storehouse with a shelf for each thing. Twelve
 * shelves, in group order, so the grid fills evenly at four, three, or two
 * across. Food is manna, shown above it.
 */
export function ResourcePanel({ resources, people }: { resources: Resources; people: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
      {RESOURCE_GROUPS.flatMap((group) => RESOURCES.filter((r) => r.group === group.key)).map((r) => (
        <StoreCell key={r.key} r={r} amount={resources[r.key]} people={people} />
      ))}
    </div>
  );
}

/** A row of the most important amounts, for the clan cards on the overview. */
export function ResourceSummary({
  resources,
  people,
  manna,
}: {
  resources: Resources;
  people: number;
  manna: MannaStatus;
}) {
  const water = daysOfSupply(resources.water, people);
  const items: { glyph: GlyphName; label: string; value: string; tone?: string }[] = [
    { glyph: "gold", label: "Gold", value: resources.gold.toLocaleString() },
    {
      glyph: "manna",
      label: manna.fed ? "Manna gathered" : "No manna today",
      value: manna.fed ? "Fed" : manna.canGather ? "Not yet" : "Hungry",
      tone: manna.fed ? "text-emerald-300" : manna.canGather ? "text-amber-300" : "text-rose-300",
    },
    { glyph: "water", label: "Water", value: water === null ? "—" : `${water}d`, tone: supplyTone(water).text },
    { glyph: "sheep", label: "Sheep", value: resources.sheep.toLocaleString() },
    { glyph: "morale", label: "Morale", value: `${resources.morale}` },
  ];
  return (
    <dl className="grid grid-cols-5 divide-x divide-line-subtle border-y border-line-subtle py-2 text-center">
      {items.map((i) => (
        <div key={i.label} title={i.label}>
          <dt className="flex justify-center text-[var(--ex-gold)]" aria-label={i.label}>
            <Glyph name={i.glyph} className="size-4.5" />
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
