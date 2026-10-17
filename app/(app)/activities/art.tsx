// Banner pictures for the activity cards. Plain SVG, animated in CSS
// (.art-* in globals.css), and still for anyone who prefers reduced motion.

import { CORE, LAKES, LAND } from "@/lib/activities/sinai-map";
import { PLACES, START, project } from "@/lib/activities/places";
import { Weave } from "./wilderness-map/weave";

// Stars as [x, y, radius]; fixed so the sky is the same every visit.
const STARS: [number, number, number][] = [
  [18, 46, 0.9], [44, 58, 0.6], [70, 40, 1.1], [96, 66, 0.7], [128, 48, 0.8], [150, 72, 0.6],
  [176, 42, 1], [204, 60, 0.7], [232, 38, 0.6], [262, 54, 0.9], [340, 44, 0.7], [372, 64, 1],
  [388, 40, 0.6], [60, 84, 0.5], [190, 86, 0.6], [118, 92, 0.5], [356, 88, 0.6], [24, 100, 0.5],
];

/** A tent of black goat hair: two poles and a low sagging roof. */
function Tent({ x, y, s = 1, lamp = false, delay = 0 }: { x: number; y: number; s?: number; lamp?: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 0-17-11Q-11-8-6-13Q0-9 6-13Q11-8 17-11L22 0Z" fill="#0b0a10" />
      <path d="M-17-11v11M-6-13V0M6-13V0M17-11v11" stroke="#1b1720" strokeWidth={0.8} />
      {lamp && (
        <path
          d="M-3 0v-6h6v6Z"
          fill="#f59e0b"
          className="art-flicker"
          style={{ animationDelay: `${delay}ms` }}
        />
      )}
    </g>
  );
}

/**
 * The camp at night: stars over the dunes, the tents of the clans, and the
 * pillar of fire standing over them (Exodus 13:21).
 */
export function CampScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 30 400 170" preserveAspectRatio="xMidYMax slice" aria-hidden className={className}>
      <defs>
        <linearGradient id="art-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070a16" />
          <stop offset="0.55" stopColor="#141a33" />
          <stop offset="0.85" stopColor="#3b2a33" />
          <stop offset="1" stopColor="#6b3f2a" />
        </linearGradient>
        <linearGradient id="art-fire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#f97316" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
        <filter id="art-soft" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="art-softer" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <radialGradient id="art-glow">
          <stop offset="0" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="art-dune-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a24" />
          <stop offset="1" stopColor="#21181a" />
        </linearGradient>
        <linearGradient id="art-dune-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3b26" />
          <stop offset="1" stopColor="#2a1c17" />
        </linearGradient>
      </defs>
      <rect y="30" width="400" height="170" fill="url(#art-sky)" />
      {STARS.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="#fef3c7"
          className="art-twinkle"
          style={{ animationDelay: `${(i * 370) % 2600}ms` }}
        />
      ))}
      {/* A thin new moon. */}
      <path d="M218 50a11 11 0 1 0 10 15 9 9 0 1 1-10-15z" fill="#fde68a" opacity="0.8" />

      {/* The pillar of fire: a soft haze around a brighter core, its light on the sand. */}
      <ellipse cx="300" cy="138" rx="110" ry="46" fill="url(#art-glow)" className="art-glow" />
      <g className="art-pillar">
        <path
          d="M292 0C291 45 286 95 282 140Q300 150 318 140C314 95 309 45 308 0Z"
          fill="url(#art-fire)"
          opacity="0.75"
          filter="url(#art-soft)"
        />
        <path
          d="M297 10C297 55 295 100 293 140Q300 144 307 140C305 100 303 55 303 10Z"
          fill="url(#art-fire)"
          filter="url(#art-softer)"
        />
        {/* Tongues of flame where it meets the sand. */}
        <path
          d="M286 142Q289 128 293 136Q296 118 300 133Q304 120 307 136Q311 128 314 142Z"
          fill="#fde68a"
          opacity="0.9"
          filter="url(#art-softer)"
          className="art-flicker"
        />
      </g>

      <path d="M0 140Q60 112 130 128T260 122T400 116V200H0Z" fill="url(#art-dune-far)" />
      <Tent x={70} y={136} s={0.8} lamp delay={300} />
      <Tent x={112} y={132} s={0.65} />
      <Tent x={214} y={130} s={0.7} lamp delay={1100} />
      <Tent x={350} y={124} s={0.6} lamp delay={700} />
      <path d="M0 170Q90 140 190 158T400 150V200H0Z" fill="url(#art-dune-near)" />
      <Tent x={160} y={164} s={1.15} lamp delay={0} />
      <Tent x={258} y={162} s={0.95} />
      {/* Wind-blown sand along the near dune's crest. */}
      <path d="M0 170Q90 140 190 158T400 150" fill="none" stroke="#fbbf24" strokeOpacity="0.25" strokeWidth="0.8" />
    </svg>
  );
}

const ROUTE = [START, ...PLACES].map((p) => project(p.lat, p.lon));
const DOPHKAH = PLACES.find((p) => p.slug === "dophkah")!;
const PIN = project(DOPHKAH.lat, DOPHKAH.lon);

/**
 * Where in the Wilderness in miniature: the whole peninsula on the camp's woven
 * lattice, the route marching along it, and a pin bobbing on Dophkah, beside
 * the clue that leads there.
 */
export function MapScene({ className = "" }: { className?: string }) {
  return (
    <div className={`wm-map relative bg-[var(--wm-sea)] ${className}`}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden className="absolute inset-0 size-full">
        <defs>
          <Weave id="art-sea-weave" k={0.6} />
        </defs>
        <rect width="400" height="200" fill="url(#art-sea-weave)" opacity="0.6" />
      </svg>
      <svg
        viewBox={`${CORE.x + 190} 150 780 860`}
        aria-hidden
        className="absolute inset-y-0 right-0 aspect-[780/860] h-full [mask-image:linear-gradient(to_right,transparent,#000_40%)]"
      >
        <defs>
          <Weave id="art-weave" k={1.6} />
          <radialGradient id="art-map-glow">
            <stop offset="0" stopColor="#fbbf24" stopOpacity="0.14" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={LAND} fill="var(--wm-land)" stroke="var(--wm-coast)" strokeWidth={2} />
        <path d={LAND} fill="url(#art-weave)" />
        <path d={LAKES} fill="var(--wm-sea)" />
        <circle cx={PIN.x} cy={PIN.y} r="280" fill="url(#art-map-glow)" />
        <polyline
          points={ROUTE.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#fbbf24"
          strokeOpacity="0.85"
          strokeWidth={5}
          strokeDasharray="2 16"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="art-march"
        />
        {ROUTE.slice(1).map((p, i) =>
          PLACES[i].region ? null : <circle key={i} cx={p.x} cy={p.y} r={7} fill="var(--wm-dot)" opacity={0.9} />,
        )}
        <g transform={`translate(${PIN.x} ${PIN.y})`}>
          <circle r="22" fill="none" stroke="#34d399" strokeWidth="4" className="wm-ping" />
          <g className="art-bob">
            <path
              d="M0 0C-4-13-22-23-22-40a22 22 0 0 1 44 0c0 17-18 27-22 40z"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="3"
            />
            <circle cy="-40" r="7" fill="#78350f" />
          </g>
        </g>
      </svg>
      {/* The clue that leads to the pin. */}
      <div className="absolute inset-y-0 left-[7%] flex w-[38%] max-w-44 items-center">
        <div className="art-clue ex-scroll w-full px-3 py-3 text-center">
          <p className="text-[9px] font-semibold tracking-[0.2em] text-[var(--ex-gold)] uppercase">Clue</p>
          <p className="mt-1 font-display text-lg leading-tight font-semibold text-slate-50 sm:text-xl">Knocking</p>
          <p className="mt-1 text-[10px] text-slate-500">Numbers 33:12</p>
        </div>
      </div>
    </div>
  );
}
