"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BORDERS, CORE, LAKES, LAND, MAP_BOUNDS, MAP_HEIGHT, MAP_WIDTH, RIVERS } from "@/lib/activities/sinai-map";
import { MODERN_LABELS, PLACES, START, project, type Place } from "@/lib/activities/places";
import { easeOut, useTween } from "./motion";
import { Weave } from "./weave";

type Point = { x: number; y: number };

const ROUTE = [START, ...PLACES].map((p) => project(p.lat, p.lon));
const START_POINT = project(START.lat, START.lon);

// One faint line per whole degree, for that atlas feel.
const PARALLELS = [28, 29, 30, 31].map((lat) => ({ lat, y: project(lat, 0).y }));
const MERIDIANS = Array.from(
  { length: Math.floor(MAP_BOUNDS.east) - Math.ceil(MAP_BOUNDS.west) + 1 },
  (_, i) => Math.ceil(MAP_BOUNDS.west) + i,
).map((lon) => ({ lon, x: project(0, lon).x }));

/** The map's box on screen, and how much of it its scrolling window shows. */
type Box = { w: number; h: number; fw: number; fh: number };
// Before the first measurement: a box the shape of the Sinai.
const UNMEASURED: Box = { w: 800, h: (800 * CORE.height) / CORE.width, fw: 1, fh: 1 };

/**
 * Where the map rests: the Sinai, widened to the box's shape so a wide screen
 * sees more of Egypt and Arabia either side instead of empty margins.
 */
function homeView({ w, h }: Box) {
  const r = w / h;
  let vw = CORE.height * r;
  let vh = CORE.height;
  if (vw < CORE.width) [vw, vh] = [CORE.width, CORE.width / r];
  if (vw > MAP_WIDTH) [vw, vh] = [MAP_WIDTH, MAP_WIDTH / r];
  const x = Math.min(Math.max(CORE.x + CORE.width / 2 - vw / 2, 0), MAP_WIDTH - vw);
  return [x, CORE.y + (CORE.height - vh) / 2, vw, vh];
}

// 50 km in map units: a degree of latitude is about 111 km.
const KM50 = (50 / 111) * (project(28, 0).y - project(29, 0).y);

/**
 * The part of the map that frames both the guess and the answer, with room
 * around them and the box's own shape, so the reveal can zoom in on it. On
 * phones, where the map is bigger than its window, it frames them inside the
 * share of the map that's actually on screen. Never wider than home.
 */
function frame(a: Point, b: Point, box: Box) {
  const aspect = box.h / box.w;
  const [, , homeW] = homeView(box);
  let w = Math.max(
    (Math.abs(a.x - b.x) * 1.5 + 260) / box.fw,
    (Math.abs(a.y - b.y) * 1.5 + 160) / (box.fh * aspect),
    // Closest zoom: about 0.6 map units per screen pixel, so a big screen doesn't zoom in too far.
    Math.max(320 / box.fw, box.w * 0.6),
  );
  w = Math.min(w, homeW);
  const h = w * aspect;
  const x = Math.min(Math.max((a.x + b.x) / 2 - w / 2, 0), MAP_WIDTH - w);
  const y = Math.min(Math.max((a.y + b.y) / 2 - h / 2, 0), Math.max(0, MAP_HEIGHT - h));
  return [x, y, w, h];
}

/**
 * A gray modern map of the Sinai with every stop labeled. Clicking anywhere
 * calls `onPick` with the spot in map units; Enter on a place picks it too.
 * Once `answer` is set it zooms to frame the guess and the answer and draws
 * the line between them.
 */
export function SinaiMap({
  guess,
  answer,
  points,
  onPick,
  fluid = false,
}: {
  guess: Point | null;
  /** Set once the round is revealed. */
  answer: Place | null;
  /** Points won, floated over the answer on reveal. */
  points?: number;
  onPick?: (point: Point) => void;
  /** Large screens: fill the height it's given, widening the view to match. */
  fluid?: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [ripple, setRipple] = useState<(Point & { key: number }) | null>(null);
  const box = useMapBox(svg);
  // useId's characters aren't all safe inside url(#…), so keep the plain ones.
  const weave = `wm-weave${useId().replace(/[^\w-]/g, "")}`;

  const target = answer ? project(answer.lat, answer.lon) : null;
  const goal = target && guess ? frame(guess, target, box) : homeView(box);
  const [vx, vy, vw, vh] = useTween(goal, 1100, { delay: target ? 150 : 0 });

  // In a phone's window, glide over to the middle of whatever is being shown.
  // When the guess was too far off for both to fit, the answer and its label
  // win: the window keeps them in view and lets the pin go off the side.
  const goalKey = goal.join(",");
  useEffect(() => {
    const el = svg.current;
    const win = el?.closest<HTMLElement>("[data-map-window]");
    if (!el || !win || win.scrollWidth <= win.clientWidth) return;
    const [x, y, w, h] = goalKey.split(",").map(Number);
    const px = (p: Point) => ({ x: ((p.x - x) / w) * el.clientWidth, y: ((p.y - y) / h) * el.clientHeight });
    const mid = px(target && guess ? { x: (guess.x + target.x) / 2, y: (guess.y + target.y) / 2 } : { x: x + w / 2, y: y + h / 2 });
    let left = mid.x - win.clientWidth / 2;
    let top = mid.y - win.clientHeight / 2;
    if (target) {
      const a = px(target);
      // Room for a label either side of the answer, and for the "+points" above it.
      const side = Math.min(150, win.clientWidth / 2);
      const above = Math.min(70, win.clientHeight / 2);
      left = Math.min(Math.max(left, a.x + side - win.clientWidth), a.x - side);
      top = Math.min(Math.max(top, a.y + 40 - win.clientHeight), a.y - above);
    }
    win.scrollTo({ left, top, behavior: "smooth" });
    // Only when the goal moves; the guess and target are part of it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalKey]);
  // Drawing scale, in map units per screen pixel (times 0.8), so labels and
  // marks stay the same size on screen however big the map is or far it zooms.
  const k = (vw / box.w) * 0.8;
  const [line] = useTween([target ? 1 : 0], target ? 900 : 1, { delay: target ? 700 : 0, ease: easeOut });

  function pick(e: React.MouseEvent<SVGSVGElement>) {
    const ctm = svg.current?.getScreenCTM();
    if (!ctm || !onPick) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    setRipple({ x: p.x, y: p.y, key: e.timeStamp });
    onPick({ x: p.x, y: p.y });
  }

  return (
    <svg
      ref={svg}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      onClick={pick}
      className={`wm-map block aspect-[1000/1021] h-auto w-full touch-manipulation select-none ${
        fluid ? "lg:aspect-auto lg:h-full" : ""
      } ${onPick ? "cursor-crosshair" : ""}`}
      role="img"
      aria-label="Map of the Sinai peninsula with the places of Israel's journey"
    >
      <rect x={-MAP_WIDTH} y={-MAP_HEIGHT} width={MAP_WIDTH * 3} height={MAP_HEIGHT * 3} fill="var(--wm-sea)" />
      <g stroke="var(--wm-grid)" strokeWidth={k}>
        {PARALLELS.map(({ lat, y }) => (
          <line key={lat} x1={0} x2={MAP_WIDTH} y1={y} y2={y} />
        ))}
        {MERIDIANS.map(({ lon, x }) => (
          <line key={lon} y1={0} y2={MAP_HEIGHT} x1={x} x2={x} />
        ))}
      </g>
      <defs>
        <Weave id={weave} k={k} />
      </defs>
      <path d={LAND} fill="var(--wm-land)" stroke="var(--wm-coast)" strokeWidth={k} strokeLinejoin="round" />
      <path d={LAND} fill={`url(#${weave})`} pointerEvents="none" />
      <path d={LAKES} fill="var(--wm-sea)" stroke="var(--wm-coast)" strokeWidth={0.75 * k} />
      <path d={RIVERS} fill="none" stroke="var(--wm-sea)" strokeWidth={1.6 * k} strokeLinecap="round" />
      <path
        d={BORDERS}
        fill="none"
        stroke="var(--wm-border)"
        strokeWidth={1.2 * k}
        strokeDasharray={`${6 * k} ${5 * k}`}
      />

      <g className="font-sans" fill="var(--wm-muted)" fontSize={11 * k} letterSpacing={k}>
        {PARALLELS.map(({ lat, y }) => (
          <text key={lat} x={vx + 8 * k} y={y - 5 * k}>{`${lat}°N`}</text>
        ))}
        {MERIDIANS.map(({ lon, x }) => (
          <text key={lon} x={x + 5 * k} y={vy + vh - 8 * k}>{`${lon}°E`}</text>
        ))}
      </g>

      {MODERN_LABELS.map((l) => {
        const { x, y } = project(l.lat, l.lon);
        return (
          <text
            key={l.name}
            x={x}
            y={y}
            textAnchor="middle"
            transform={l.rotate ? `rotate(${l.rotate} ${x} ${y})` : undefined}
            fill={l.kind === "water" ? "var(--wm-water-text)" : "var(--wm-muted)"}
            fontSize={(l.kind === "water" ? 15 : 13) * k}
            fontStyle={l.kind === "water" ? "italic" : undefined}
            letterSpacing={(l.kind === "water" ? 1.5 : 4) * k}
            className={l.kind === "water" ? "font-display" : "font-sans"}
          >
            {l.kind === "country" ? l.name.toUpperCase() : l.name}
          </text>
        );
      })}

      {PLACES.filter((p) => p.region).map((p) => {
        const { x, y } = project(p.lat, p.lon);
        const hit = answer?.slug === p.slug;
        return (
          <ellipse
            key={p.slug}
            cx={x}
            cy={y}
            rx={p.region!.rx}
            ry={p.region!.ry}
            fill={hit ? "var(--wm-answer-soft)" : "var(--wm-region)"}
            stroke={hit ? "var(--wm-answer)" : "var(--wm-region-edge)"}
            strokeWidth={1.2 * k}
            strokeDasharray={`${3 * k} ${5 * k}`}
            className="wm-region"
          />
        );
      })}

      <polyline
        points={ROUTE.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="var(--wm-route)"
        strokeWidth={2 * k}
        strokeDasharray={`${k} ${7 * k}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="wm-route"
      />

      <Compass x={vx + vw - 52 * k} y={vy + 60 * k} k={k} />
      <ScaleBar x={vx + vw - 24 * k} y={vy + vh - 26 * k} k={k} />

      <g>
        <circle
          cx={START_POINT.x}
          cy={START_POINT.y}
          r={5 * k}
          fill="var(--wm-land)"
          stroke="var(--wm-muted)"
          strokeWidth={2 * k}
        />
        <Label x={START_POINT.x - 10 * k} y={START_POINT.y - 10 * k} anchor="end" k={k} muted>
          {START.name}
        </Label>
      </g>

      {PLACES.map((p) => (
        <PlaceMark key={p.slug} place={p} k={k} highlight={answer?.slug === p.slug} onPick={onPick} />
      ))}

      {ripple && onPick && (
        <circle
          key={ripple.key}
          cx={ripple.x}
          cy={ripple.y}
          r={22 * k}
          fill="none"
          stroke="var(--wm-pin)"
          strokeWidth={2 * k}
          className="wm-ripple"
          pointerEvents="none"
        />
      )}

      {target && guess && line > 0 && (
        <line
          x1={guess.x}
          y1={guess.y}
          x2={guess.x + (target.x - guess.x) * line}
          y2={guess.y + (target.y - guess.y) * line}
          stroke="var(--wm-line)"
          strokeWidth={2.5 * k}
          strokeDasharray={`${7 * k} ${6 * k}`}
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
      {target && line >= 1 && (
        <g pointerEvents="none">
          <circle
            cx={target.x}
            cy={target.y}
            r={12 * k}
            fill="none"
            stroke="var(--wm-answer)"
            strokeWidth={2.5 * k}
            className="wm-ping"
          />
          <circle
            cx={target.x}
            cy={target.y}
            r={8 * k}
            fill="var(--wm-answer)"
            stroke="var(--wm-land)"
            strokeWidth={2.5 * k}
            className="wm-pop"
          />
          {points !== undefined && (
            <text
              x={target.x}
              y={target.y - 26 * k}
              textAnchor="middle"
              fontSize={22 * k}
              fontWeight={700}
              fill="var(--wm-answer)"
              stroke="var(--wm-land)"
              strokeWidth={5 * k}
              paintOrder="stroke"
              className="wm-float font-display"
            >
              {`+${points.toLocaleString()}`}
            </text>
          )}
        </g>
      )}
      {guess && <Pin x={guess.x} y={guess.y} k={k} />}
    </svg>
  );
}

/**
 * The map's size on screen, and the share of it its scrolling window shows
 * ([1, 1] when the whole map is on screen).
 */
function useMapBox(svg: React.RefObject<SVGSVGElement | null>): Box {
  const [box, setBox] = useState<Box>(UNMEASURED);
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const win = el.closest<HTMLElement>("[data-map-window]") ?? el;
    const measure = () => {
      const w = el.clientWidth || UNMEASURED.w;
      const h = el.clientHeight || UNMEASURED.h;
      setBox({ w, h, fw: Math.min(1, win.clientWidth / w), fh: Math.min(1, win.clientHeight / h) });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(win);
    observer.observe(el);
    return () => observer.disconnect();
  }, [svg]);
  return box;
}

function PlaceMark({
  place,
  k,
  highlight,
  onPick,
}: {
  place: Place;
  k: number;
  highlight: boolean;
  onPick?: (point: Point) => void;
}) {
  const { x, y } = project(place.lat, place.lon);
  const { dx, dy, anchor } = place.label;
  const interactive = Boolean(onPick);
  return (
    <g
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? `Guess ${place.name}` : place.name}
      onKeyDown={(e) => {
        if (onPick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onPick({ x, y });
        }
      }}
      className={`wm-place outline-none ${interactive ? "wm-live" : ""}`}
    >
      {place.region ? (
        <circle cx={x} cy={y} r={3 * k} fill="var(--wm-region-edge)" />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={5.5 * k}
          fill="var(--wm-dot)"
          stroke="var(--wm-land)"
          strokeWidth={2.5 * k}
          className="wm-dot"
        />
      )}
      <Label x={x + dx * k} y={y + dy * k} anchor={anchor} k={k} region={Boolean(place.region)} strong={highlight}>
        {place.name}
      </Label>
    </g>
  );
}

function Label({
  x,
  y,
  anchor,
  k,
  children,
  region,
  muted,
  strong,
}: {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  k: number;
  children: string;
  region?: boolean;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontSize={(region ? 14 : 15) * k}
      fontWeight={strong ? 700 : region ? 500 : 600}
      fontStyle={region ? "italic" : undefined}
      letterSpacing={(region ? 0.5 : 0.2) * k}
      fill={strong ? "var(--wm-answer)" : muted ? "var(--wm-muted)" : region ? "var(--wm-region-text)" : "var(--wm-text)"}
      stroke="var(--wm-land)"
      strokeWidth={4 * k}
      strokeLinejoin="round"
      paintOrder="stroke"
      className="wm-label font-sans"
    >
      {children}
    </text>
  );
}

/** The player's guess: an amber map pin with its tip on the spot. */
function Pin({ x, y, k }: Point & { k: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} pointerEvents="none">
      <g className="wm-drop">
        <ellipse cx={0} cy={0} rx={5} ry={2} fill="black" opacity={0.3} />
        <path
          d="M0 0C-2-6-10-11-10-19a10 10 0 0 1 20 0c0 8-8 13-10 19z"
          fill="var(--wm-pin)"
          stroke="var(--wm-pin-edge)"
          strokeWidth={1.5}
        />
        <circle cx={0} cy={-19} r={3.5} fill="var(--wm-pin-edge)" />
      </g>
    </g>
  );
}

/** A small gold compass rose that settles on north. */
function Compass({ x, y, k }: Point & { k: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} pointerEvents="none" className="text-[var(--ex-gold)]">
      <g className="wm-compass" opacity={0.75}>
        <circle r={30} fill="none" stroke="currentColor" strokeOpacity={0.35} />
        <circle r={24} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeDasharray="1 3" />
        <path d="M-26 0 0 4 26 0 0-4Z" fill="currentColor" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.4} />
        <path d="M0-26 5 0 0 26-5 0Z" fill="currentColor" fillOpacity={0.15} stroke="currentColor" strokeOpacity={0.6} />
        <path d="M0-26 5 0H-5Z" fill="currentColor" fillOpacity={0.8} />
      </g>
      <text y={-36} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor" className="font-display">
        N
      </text>
    </g>
  );
}

/** A 50 km bar whose right end sits at `x`. */
function ScaleBar({ x, y, k }: Point & { k: number }) {
  const len = KM50;
  return (
    <g pointerEvents="none" fill="var(--wm-muted)" stroke="var(--wm-muted)" strokeWidth={1.5 * k}>
      <path d={`M${x - len} ${y - 4 * k}V${y}H${x}V${y - 4 * k}`} fill="none" />
      <text
        x={x - len / 2}
        y={y - 8 * k}
        textAnchor="middle"
        fontSize={11 * k}
        stroke="none"
        letterSpacing={k}
        className="font-sans"
      >
        50 km
      </text>
    </g>
  );
}
