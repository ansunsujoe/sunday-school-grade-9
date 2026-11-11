"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { CLANS, type ClanSlug } from "@/lib/exodus/clans";
import { REGIONS, TERRITORIES, regionInfo, type RegionSlug } from "@/lib/verse-map/map";
import { GRATICULE, MAP_HEIGHT, MAP_WIDTH, SHAPES, SPHERE } from "@/lib/verse-map/shapes";

/** Each clan's color on the map, matching its accent elsewhere in the game. */
export const CLAN_FILL: Record<ClanSlug, string> = {
  eagle: "#38bdf8",
  lion: "#f59e0b",
  monkey: "#fb7185",
  bear: "#34d399",
  shark: "#818cf8",
  turtle: "#2dd4bf",
};
/** For a student who doesn't lead a clan yet. */
export const NO_CLAN_FILL = "#f8fafc";

/**
 * Claimed land on the map: each clan's color running from bright at the top
 * of a territory to deep at the bottom, edged in its darkest shade.
 */
const CLAN_LAND: Record<ClanSlug | "none", { top: string; bottom: string; edge: string }> = {
  eagle: { top: "#38bdf8", bottom: "#0369a1", edge: "#0c4a6e" },
  lion: { top: "#fbbf24", bottom: "#c2410c", edge: "#7c2d12" },
  monkey: { top: "#fb7185", bottom: "#be123c", edge: "#881337" },
  bear: { top: "#34d399", bottom: "#047857", edge: "#064e3b" },
  shark: { top: "#818cf8", bottom: "#4338ca", edge: "#312e81" },
  turtle: { top: "#2dd4bf", bottom: "#0f766e", edge: "#134e4a" },
  none: { top: "#f8fafc", bottom: "#94a3b8", edge: "#475569" },
};

export type MapHolder = { userId: number; name: string; clan: ClanSlug | null; soldiers: number };

/**
 * Unclaimed land is light parchment, with just a faint difference between
 * neighbors (the build script picks each territory's shade so neighbors never
 * match). Only claimed land is bright.
 */
const PARCHMENT = ["#ecdfc0", "#e3d4b0", "#e8dab8", "#dfcfa9"];
const INK = "#1f1408";
const HALO = "#fbf6e9";
const VERSE_INK = "#7c3f0b";

/** A passage shortened to fit under a region's name on a phone, e.g. "Heb 11:1–11". */
function shortPassage(passage: string) {
  return passage.replace("Psalm", "Ps").replace("Philippians", "Phil").replace("Hebrews", "Heb");
}
const GOLD = "#fbbf24";

// On-screen sizes in pixels, a little smaller on a phone.
const NAME_PX = { phone: 11, wide: 12 }; // territory names, in a region
const REGION_PX = { phone: 10, wide: 14 }; // region names, on the whole world
const EMBLEM_PX = 13; // radius of a clan emblem, in a region (smaller on the whole world)
// Below this width (px) the map counts as on a phone: a region opens in a square frame, for more room.
const PHONE_PX = 640;

// Names moved off their spot, as a share of the name's size, where neighbors would crowd them.
const NUDGE: Record<string, [number, number]> = {
  caucasus: [0.6, -0.7],
  "asia-minor": [-0.5, 0.2],
  prussia: [0.2, -0.3],
  italy: [0.4, 0.5],
  russia: [-0.5, 0],
  volga: [0.5, 0.2],
  israel: [-0.3, 0.3],
};

/** A name on one line, or on two when it's much wider than the land under it. */
function labelLines(name: string, fontSize: number, size: number) {
  const words = name.split(" ");
  if (words.length < 2 || name.length * fontSize * 0.55 < size * 1.25) return [name];
  let best = [name];
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    if (Math.abs(a.length - b.length) < diff) {
      diff = Math.abs(a.length - b.length);
      best = [a, b];
    }
  }
  return best;
}

type View = { x: number; y: number; w: number; h: number };
const WORLD: View = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };

/** A region's main landmasses with some sea around them, fitted to a frame `aspect` (width ÷ height) wide. */
function regionView(region: RegionSlug, aspect: number): View {
  const boxes = TERRITORIES.filter((t) => t.region === region).map((t) => SHAPES[t.slug].box);
  const x0 = Math.min(...boxes.map((b) => b[0]));
  const y0 = Math.min(...boxes.map((b) => b[1]));
  const x1 = Math.max(...boxes.map((b) => b[2]));
  const y1 = Math.max(...boxes.map((b) => b[3]));
  const pad = 0.1;
  let w = (x1 - x0) * (1 + pad * 2);
  let h = (y1 - y0) * (1 + pad * 2);
  // Widen or heighten to the frame's shape, so the region fills it without stretching.
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
}

const VIEWS = {
  wide: Object.fromEntries(REGIONS.map((r) => [r.slug, regionView(r.slug, MAP_WIDTH / MAP_HEIGHT)])),
  phone: Object.fromEntries(REGIONS.map((r) => [r.slug, regionView(r.slug, 1)])),
} as Record<"wide" | "phone", Record<RegionSlug, View>>;

/** Where each region's name sits on the whole world, picked by hand to keep clear of its neighbors. */
const REGION_LABEL: Record<RegionSlug, [number, number]> = {
  "north-america": [235, 125],
  "south-america": [330, 320],
  europe: [520, 72],
  africa: [560, 265],
  "middle-east": [652, 182],
  asia: [810, 105],
  oceania: [885, 352],
};

/** Glides the view from where it is to `target`. */
function useGlide(target: View) {
  const [view, setView] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    // With reduced motion, jump straight there on the first frame.
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const p = duration ? Math.min(1, (now - start) / duration) : 1;
      const e = 1 - Math.pow(1 - p, 3);
      const next = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      };
      current.current = next;
      setView(next);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return view;
}

/**
 * The world as a game board, in two steps. First the whole world, with the
 * region names: tap a region to fly in. Then that region fills the frame
 * with its territories named at a readable size: tap one to choose it, or go
 * back out to the world. Unclaimed land is parchment; claimed land is its
 * holder's clan color with the clan's emblem and its number of soldiers.
 */
export function WorldMap({
  holders,
  selected,
  onSelect,
}: {
  holders: Record<string, MapHolder>;
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const [region, setRegion] = useState<RegionSlug | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [framePx, setFramePx] = useState(900);
  const screen = framePx < PHONE_PX ? "phone" : "wide";
  const square = region !== null && screen === "phone";
  const view = useGlide(region ? VIEWS[screen][region] : WORLD);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setFramePx(entry.contentRect.width || 900));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Map units per pixel on screen right now, so names and emblems keep the same size as the view moves.
  const u = view.w / framePx;
  const nameSize = NAME_PX[screen] * u;

  // The selected territory is drawn last, so its outline isn't hidden under a neighbor.
  const order = [...TERRITORIES].sort((a, b) => Number(a.slug === selected) - Number(b.slug === selected));
  // Its glow shows only in its own region's view.
  const selectedShape =
    selected && region && TERRITORIES.find((t) => t.slug === selected)?.region === region ? SHAPES[selected] : null;

  function choose(slug: string) {
    const t = TERRITORIES.find((t) => t.slug === slug)!;
    if (region === t.region) onSelect(slug);
    else setRegion(t.region);
  }

  return (
    <div>
      {/* The frame is as tall as the whole map at its width (100cqw is that width), or square for a region on a phone. */}
      <div className="@container relative overflow-hidden border border-[var(--ex-rule)] bg-[#051226] shadow-[inset_0_0_0_4px_var(--ex-rule-soft)]">
        <div
          ref={frame}
          className="transition-[height] duration-500 ease-out motion-reduce:transition-none"
          style={{ height: square ? "100cqw" : `${((100 * MAP_HEIGHT) / MAP_WIDTH).toFixed(3)}cqw` }}
        >
          <svg
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            className="block size-full select-none"
            role="group"
            aria-label={region ? `Map of ${regionInfo(region).name}` : "World map"}
          >
            <defs>
              <radialGradient id="wm-sea" cx="50%" cy="42%" r="62%">
                <stop offset="0%" stopColor="#1d5f96" />
                <stop offset="55%" stopColor="#123f6b" />
                <stop offset="100%" stopColor="#0a2546" />
              </radialGradient>
              {/* Land lifts off the sea: a shadow under it and a faint gold edge along the coast. */}
              <filter id="wm-land" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy={2 * u} stdDeviation={2 * u} floodColor="#020617" floodOpacity="0.65" />
                <feDropShadow dx="0" dy="0" stdDeviation={1.2 * u} floodColor={GOLD} floodOpacity="0.35" />
              </filter>
              <filter id="wm-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={2.5 * u} />
              </filter>
              {Object.entries(CLAN_LAND).map(([slug, c]) => (
                <linearGradient key={slug} id={`wm-clan-${slug}`} x1="0" y1="0" x2="0.35" y2="1">
                  <stop offset="0%" stopColor={c.top} />
                  <stop offset="100%" stopColor={c.bottom} />
                </linearGradient>
              ))}
              <filter id="wm-emblem-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy={1.5 * u} stdDeviation={1.8 * u} floodColor="#020617" floodOpacity="0.8" />
              </filter>
              <clipPath id="wm-emblem" clipPathUnits="objectBoundingBox">
                <circle cx="0.5" cy="0.5" r="0.5" />
              </clipPath>
            </defs>

            {/* The sea: a blue globe, its gold grid, and a double gold rim. */}
            <path d={SPHERE} fill="url(#wm-sea)" />
            <path d={GRATICULE} fill="none" stroke={GOLD} strokeOpacity="0.12" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <path d={SPHERE} fill="none" stroke={GOLD} strokeOpacity="0.6" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            <path d={SPHERE} fill="none" stroke={GOLD} strokeOpacity="0.2" strokeWidth="5" vectorEffect="non-scaling-stroke" />
            <Compass x={118} y={338} />

            {/* The land. In a region, the rest of the world fades back. */}
            <g filter="url(#wm-land)">
              {order.map((t) => {
                const holder = holders[t.slug];
                const isSelected = selected === t.slug;
                const inFocus = !region || region === t.region;
                const land = holder ? CLAN_LAND[holder.clan ?? "none"] : null;
                const fill = holder ? `url(#wm-clan-${holder.clan ?? "none"})` : PARCHMENT[SHAPES[t.slug].shade];
                return (
                  <path
                    key={t.slug}
                    d={SHAPES[t.slug].d}
                    role="button"
                    tabIndex={0}
                    aria-pressed={region === t.region ? isSelected : undefined}
                    aria-label={
                      region === t.region
                        ? `${t.name}, ${t.reference}${holder ? `, held by ${holder.name} with ${holder.soldiers} soldiers` : ", unclaimed"}`
                        : `Zoom in to ${regionInfo(t.region).name}`
                    }
                    onClick={() => choose(t.slug)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        choose(t.slug);
                      }
                    }}
                    fill={fill}
                    opacity={inFocus ? 1 : 0.45}
                    stroke={isSelected && region ? "#92400e" : (land?.edge ?? "#5c4728")}
                    strokeOpacity={isSelected && region ? 1 : land ? 0.9 : 0.55}
                    strokeWidth={isSelected && region ? 2 : land ? 1.1 : 0.7}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    className="cursor-pointer outline-none transition-[fill,opacity,filter] duration-500 hover:brightness-110 focus-visible:brightness-110"
                  />
                );
              })}
            </g>

            {/* A gold glow around the selected territory, once you're in its region. */}
            {selectedShape && region && (
              <path
                d={selectedShape.d}
                fill="none"
                stroke={GOLD}
                strokeWidth={4 * u}
                strokeOpacity="0.85"
                filter="url(#wm-glow)"
                className="pointer-events-none"
              />
            )}

            {/* Clan emblems on claimed land: everywhere on the world, and above the names in a region,
                where a gold badge also gives the territory's soldiers. */}
            {TERRITORIES.map((t) => {
              const holder = holders[t.slug];
              if (!holder || (region && region !== t.region)) return null;
              const clan = holder.clan ? CLANS.find((c) => c.slug === holder.clan) : undefined;
              if (!clan && !region) return null;
              const [x, y] = SHAPES[t.slug].label;
              const r = EMBLEM_PX * u * (region ? 1 : 0.7);
              // Above the name, which sits a little high to make room for its verse number underneath.
              const lift = region
                ? labelLines(t.name, nameSize, SHAPES[t.slug].size).length * nameSize * 0.5 + nameSize * 0.43 + r + 2 * u
                : 0;
              const badge = 6.5 * u;
              const ring = (region ? 2.2 : 1.6) * u;
              return (
                <g key={t.slug} transform={`translate(${x} ${y - lift})`} className="pointer-events-none">
                  {/* A white rim, then a ring in the clan's color, lifted off the land by a shadow. */}
                  <circle
                    r={r + ring * 2}
                    fill="#fff"
                    filter="url(#wm-emblem-shadow)"
                  />
                  <circle
                    r={r + ring / 2}
                    fill={clan ? "#020617" : NO_CLAN_FILL}
                    stroke={clan ? CLAN_FILL[clan.slug] : INK}
                    strokeWidth={ring}
                  />
                  {clan && (
                    <image
                      href={clan.logo}
                      x={-r}
                      y={-r}
                      width={r * 2}
                      height={r * 2}
                      clipPath="url(#wm-emblem)"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  )}
                  {region && (
                    <g transform={`translate(${r * 0.9} ${r * 0.75})`}>
                      <circle r={badge} fill={GOLD} stroke="#fff" strokeWidth={1.4 * u} filter="url(#wm-emblem-shadow)" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#020617"
                        className="font-sans font-bold"
                        style={{ fontSize: badge * 1.4 }}
                      >
                        {holder.soldiers}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* In a region: its territories' names, in ink like a printed map. */}
            {region &&
              TERRITORIES.filter((t) => t.region === region).map((t) => {
                const [nx, ny] = NUDGE[t.slug] ?? [0, 0];
                const x = SHAPES[t.slug].label[0] + nx * nameSize;
                const y = SHAPES[t.slug].label[1] + ny * nameSize;
                const lines = labelLines(t.name, nameSize, SHAPES[t.slug].size);
                return (
                  <Label
                    key={t.slug}
                    x={x}
                    y={y}
                    size={nameSize}
                    lines={lines}
                    sub={`v. ${t.reference.split(":")[1]}`}
                  />
                );
              })}

            {/* On the whole world: the region names, big, each with its passage. */}
            {!region &&
              REGIONS.map((r) => {
                const [x, y] = REGION_LABEL[r.slug];
                return (
                  <Label
                    key={r.slug}
                    x={x}
                    y={y}
                    size={REGION_PX[screen] * u}
                    lines={[r.name.toUpperCase()]}
                    sub={shortPassage(r.passage)}
                    spacing={0.12}
                  />
                );
              })}
          </svg>
        </div>

        {/* Overlays: the way back out, or a hint on the world. */}
        {region ? (
          <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setRegion(null)}
              className="pointer-events-auto inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-amber-300/40 bg-[#051226]/85 px-3 text-sm font-semibold text-amber-200 shadow-lg backdrop-blur transition hover:bg-[#051226]"
            >
              <Icon name="arrowLeft" className="size-4" /> World
            </button>
            {/* The region's passage: its territories take these verses, in order. */}
            <p className="min-w-0 rounded-lg border border-amber-300/40 bg-[#051226]/85 px-3 py-1.5 text-right shadow-lg backdrop-blur">
              <span className="block font-display text-xs font-semibold tracking-[0.15em] text-amber-200/80 uppercase">
                {regionInfo(region).name}
              </span>
              <span className="block font-display text-sm font-semibold text-amber-100">{regionInfo(region).passage}</span>
            </p>
          </div>
        ) : (
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-[#051226]/70 px-2.5 py-1 text-xs whitespace-nowrap text-amber-100/80 backdrop-blur">
            Tap a region to zoom in
          </p>
        )}
      </div>

      {/* The regions as buttons too, for a quick jump between them. */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Regions">
        <RegionChip active={region === null} onClick={() => setRegion(null)}>
          World
        </RegionChip>
        {REGIONS.map((r) => (
          <RegionChip key={r.slug} active={region === r.slug} onClick={() => setRegion(r.slug)}>
            {r.name}
          </RegionChip>
        ))}
      </div>
    </div>
  );
}

function RegionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-9 rounded-full border px-3 text-sm font-medium transition ${
        active
          ? "border-amber-400 bg-amber-400 text-ink"
          : "border-line bg-wash text-slate-200 hover:bg-wash-hover"
      }`}
    >
      {children}
    </button>
  );
}

/** A name in ink with a light edge, one or two lines, centered on a point. */
function Label({
  x,
  y,
  size,
  lines,
  sub,
  spacing = 0.02,
}: {
  x: number;
  y: number;
  size: number;
  lines: string[];
  /** A smaller line under the name, in brown: a verse or a passage. */
  sub?: string;
  spacing?: number;
}) {
  const subSize = size * 0.78;
  // With a line under it, the name moves up so the two stay centered on the point together.
  const top = y - (sub ? subSize * 0.55 : 0);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={INK}
      stroke={HALO}
      strokeOpacity="0.95"
      className="pointer-events-none font-display font-bold"
      style={{ fontSize: size, strokeWidth: size * 0.38, paintOrder: "stroke", strokeLinejoin: "round", letterSpacing: size * spacing }}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} y={top + (i - (lines.length - 1) / 2) * size * 1.05}>
          {line}
        </tspan>
      ))}
      {sub && (
        <tspan
          x={x}
          y={top + ((lines.length - 1) / 2) * size * 1.05 + size * 0.55 + subSize * 0.6}
          fill={VERSE_INK}
          fontWeight={600}
          style={{ fontSize: subSize, letterSpacing: subSize * 0.02 }}
        >
          {sub}
        </tspan>
      )}
    </text>
  );
}

/** A gold compass rose: two rings with ticks, and an eight-pointed star with north marked. */
function Compass({ x, y, r = 34 }: { x: number; y: number; r?: number }) {
  // A star point from the center out to `len`, split down the middle into a light and a dark half.
  const point = (angle: number, len: number, width: number) => {
    const a = (angle * Math.PI) / 180;
    const tip = [Math.sin(a) * len, -Math.cos(a) * len];
    const left = [Math.sin(a - Math.PI / 2) * width, -Math.cos(a - Math.PI / 2) * width];
    const right = [Math.sin(a + Math.PI / 2) * width, -Math.cos(a + Math.PI / 2) * width];
    return (
      <g key={angle}>
        <polygon points={`0,0 ${left.join(",")} ${tip.join(",")}`} fill={GOLD} />
        <polygon points={`0,0 ${right.join(",")} ${tip.join(",")}`} fill="#92400e" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y})`} className="pointer-events-none" aria-hidden>
      <circle r={r} fill="#051226" fillOpacity="0.45" stroke={GOLD} strokeOpacity="0.7" strokeWidth="1" />
      <circle r={r - 4} fill="none" stroke={GOLD} strokeOpacity="0.4" strokeWidth="0.6" />
      {Array.from({ length: 32 }, (_, i) => {
        const a = (i * 360) / 32;
        const long = i % 4 === 0;
        return (
          <line
            key={i}
            y1={-(r - 4)}
            y2={-(r - (long ? 9 : 6.5))}
            transform={`rotate(${a})`}
            stroke={GOLD}
            strokeOpacity="0.6"
            strokeWidth={long ? 0.9 : 0.5}
          />
        );
      })}
      {[45, 135, 225, 315].map((a) => point(a, r * 0.5, 3))}
      {[0, 90, 180, 270].map((a) => point(a, r * 0.82, 4.5))}
      <circle r="2" fill="#051226" stroke={GOLD} strokeWidth="0.8" />
      <text
        y={-r - 5}
        textAnchor="middle"
        fill={GOLD}
        className="font-display font-bold"
        style={{ fontSize: 9, letterSpacing: 0.5 }}
      >
        N
      </text>
    </g>
  );
}
