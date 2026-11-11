// Draws Verse Royale's map: real coastlines and borders (Natural Earth
// 1:110m, from the world-atlas package), with every country given to one
// territory. The biggest countries are split between their territories,
// each part going to the territory whose point (in lib/verse-map/map.ts) is
// nearest. Writes lib/verse-map/shapes.ts; run with `npm run build-map`.

import { readFileSync, writeFileSync } from "node:fs";
import { geoArea, geoCentroid, geoContains, geoDistance, geoGraticule10, geoNaturalEarth1, geoStream } from "d3-geo";
import { Delaunay } from "d3-delaunay";
import polygonClipping, { type MultiPolygon, type Polygon } from "polygon-clipping";
import polylabel from "polylabel";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, MultiPolygon as GeoMulti, Polygon as GeoPoly, Position } from "geojson";
import { TERRITORIES } from "../lib/verse-map/map";

const WIDTH = 1000;
const OUT = "lib/verse-map/shapes.ts";

// Countries big enough to hold more than one territory; each is split among the territories whose points it holds.
const SPLIT = [
  "United States of America",
  "Canada",
  "Brazil",
  "Argentina",
  "Russia",
  "China",
  "India",
  "Australia",
  "Algeria",
  "Indonesia",
];

// Every other country, by its Natural Earth name, and the territory it belongs to.
const COUNTRY: Record<string, string> = {
  // North America
  Greenland: "greenland",
  Mexico: "mexico",
  ...Object.fromEntries(
    [
      "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Cuba", "Haiti",
      "Dominican Rep.", "Jamaica", "Bahamas", "Puerto Rico", "Trinidad and Tobago",
    ].map((n) => [n, "central-america"]),
  ),
  // South America
  ...Object.fromEntries(["Panama", "Colombia", "Venezuela", "Ecuador"].map((n) => [n, "gran-colombia"])),
  ...Object.fromEntries(["Guyana", "Suriname"].map((n) => [n, "amazon"])),
  ...Object.fromEntries(["Peru", "Bolivia"].map((n) => [n, "andes"])),
  ...Object.fromEntries(["Paraguay", "Uruguay"].map((n) => [n, "pampas"])),
  ...Object.fromEntries(["Chile", "Falkland Is."].map((n) => [n, "patagonia"])),
  // Europe
  ...Object.fromEntries(["Norway", "Sweden", "Finland", "Denmark", "Iceland"].map((n) => [n, "scandinavia"])),
  ...Object.fromEntries(["United Kingdom", "Ireland"].map((n) => [n, "britain"])),
  ...Object.fromEntries(["Spain", "Portugal"].map((n) => [n, "iberia"])),
  ...Object.fromEntries(["France", "Belgium", "Netherlands", "Luxembourg", "Switzerland"].map((n) => [n, "france"])),
  ...Object.fromEntries(["Germany", "Poland", "Czechia", "Austria", "Slovakia"].map((n) => [n, "prussia"])),
  Italy: "italy",
  ...Object.fromEntries(
    [
      "Hungary", "Romania", "Bulgaria", "Greece", "Albania", "Macedonia", "North Macedonia", "Serbia",
      "Montenegro", "Kosovo", "Bosnia and Herz.", "Croatia", "Slovenia",
    ].map((n) => [n, "balkans"]),
  ),
  ...Object.fromEntries(["Ukraine", "Belarus", "Moldova"].map((n) => [n, "ukraine"])),
  ...Object.fromEntries(["Estonia", "Latvia", "Lithuania"].map((n) => [n, "russia"])),
  // Middle East
  Kazakhstan: "steppe",
  ...Object.fromEntries(
    ["Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan", "Afghanistan", "Pakistan"].map((n) => [n, "turkestan"]),
  ),
  ...Object.fromEntries(["Turkey", "Cyprus", "N. Cyprus"].map((n) => [n, "asia-minor"])),
  ...Object.fromEntries(["Georgia", "Armenia", "Azerbaijan"].map((n) => [n, "caucasus"])),
  ...Object.fromEntries(["Israel", "Palestine", "Lebanon", "Jordan", "Syria"].map((n) => [n, "israel"])),
  ...Object.fromEntries(["Iran", "Iraq"].map((n) => [n, "persia"])),
  ...Object.fromEntries(
    ["Saudi Arabia", "Yemen", "Oman", "United Arab Emirates", "Qatar", "Kuwait"].map((n) => [n, "arabia"]),
  ),
  // Africa
  ...Object.fromEntries(["Morocco", "W. Sahara", "Tunisia"].map((n) => [n, "barbary-coast"])),
  Libya: "sahara",
  Egypt: "egypt",
  ...Object.fromEntries(["Mauritania", "Mali", "Senegal", "Gambia"].map((n) => [n, "timbuktu"])),
  ...Object.fromEntries(["Chad", "Central African Rep.", "Cameroon"].map((n) => [n, "chad"])),
  ...Object.fromEntries(["Sudan", "S. Sudan"].map((n) => [n, "sudan"])),
  ...Object.fromEntries(["Ethiopia", "Eritrea", "Djibouti", "Somalia", "Somaliland"].map((n) => [n, "abyssinia"])),
  ...Object.fromEntries(
    ["Ghana", "Côte d'Ivoire", "Burkina Faso", "Guinea", "Guinea-Bissau", "Liberia", "Sierra Leone"].map((n) => [
      n,
      "gold-coast",
    ]),
  ),
  ...Object.fromEntries(["Nigeria", "Niger", "Benin", "Togo"].map((n) => [n, "nigeria"])),
  ...Object.fromEntries(["Dem. Rep. Congo", "Congo", "Gabon", "Eq. Guinea"].map((n) => [n, "congo"])),
  ...Object.fromEntries(["Kenya", "Tanzania", "Uganda", "Rwanda", "Burundi"].map((n) => [n, "zanzibar"])),
  ...Object.fromEntries(["Angola", "Zambia"].map((n) => [n, "angola"])),
  ...Object.fromEntries(["Zimbabwe", "Mozambique", "Malawi"].map((n) => [n, "zambezi"])),
  Madagascar: "madagascar",
  ...Object.fromEntries(["South Africa", "Namibia", "Botswana", "Lesotho", "eSwatini"].map((n) => [n, "south-africa"])),
  // Asia
  Mongolia: "mongolia",
  ...Object.fromEntries(["North Korea", "South Korea"].map((n) => [n, "manchuria"])),
  Japan: "japan",
  Taiwan: "canton",
  ...Object.fromEntries(["Nepal", "Bhutan", "Bangladesh"].map((n) => [n, "india"])),
  "Sri Lanka": "ceylon",
  ...Object.fromEntries(["Myanmar", "Thailand", "Laos", "Cambodia", "Vietnam"].map((n) => [n, "siam"])),
  // Oceania
  ...Object.fromEntries(["Malaysia", "Brunei", "Philippines", "Timor-Leste"].map((n) => [n, "east-indies"])),
  ...Object.fromEntries(["Papua New Guinea", "Solomon Is."].map((n) => [n, "new-guinea"])),
  ...Object.fromEntries(["New Zealand", "Fiji", "Vanuatu", "New Caledonia"].map((n) => [n, "new-zealand"])),
};

const SKIP = new Set(["Antarctica", "Fr. S. Antarctic Lands"]);

// --- Load and project ------------------------------------------------------

const topology = JSON.parse(readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"));
const countries = feature(topology, topology.objects.countries) as unknown as FeatureCollection<
  GeoPoly | GeoMulti,
  { name: string }
>;

const projection = geoNaturalEarth1();

/** A country's polygons, minus specks in the far south. */
function partsOf(f: Feature<GeoPoly | GeoMulti>): Position[][][] {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polys.filter((poly) => Math.max(...poly[0].map((p) => p[1])) > -56);
}

/**
 * Projects a polygon onto the map. The projection's own clipping cuts any
 * shape that crosses the 180th meridian (Russia, Fiji) into pieces on each
 * side, so each ring that comes out is kept as a polygon of its own.
 */
function project(poly: Position[][], keep: (lon: number) => boolean = () => true): Polygon[] {
  const rings: [number, number][][] = [];
  let ring: [number, number][] = [];
  const stream = projection.stream({
    point: (x: number, y: number) => void ring.push([x, y]),
    lineStart: () => void (ring = []),
    lineEnd: () => void (ring.length > 2 && rings.push(ring)),
    polygonStart: () => {},
    polygonEnd: () => {},
    sphere: () => {},
  });
  // Outer rings only: holes in 1:110m data are all neighbors in the same territory.
  geoStream({ type: "Polygon", coordinates: [poly[0]] }, stream);
  return rings
    .filter((r) => {
      const [x, y] = r.reduce((a, p) => [a[0] + p[0] / r.length, a[1] + p[1] / r.length], [0, 0]);
      const lonLat = projection.invert?.([x, y]);
      return lonLat ? keep(lonLat[0]) : true;
    })
    .map((r) => [r]);
}

// Specks of a split country on the far side of the date line (Russia's tip, the Aleutians) are left off.
const nearSide = (name: string) => (lon: number) =>
  name === "Russia" ? lon > -100 : name === "United States of America" ? lon < 0 : true;

const pieces = new Map<string, Polygon[]>(); // territory -> projected polygons
const add = (slug: string, poly: Polygon) => pieces.set(slug, [...(pieces.get(slug) ?? []), poly]);
const missing: string[] = [];

const nearest = (point: [number, number], among = TERRITORIES) =>
  among.reduce((best, t) => (geoDistance(point, [t.lon, t.lat]) < geoDistance(point, [best.lon, best.lat]) ? t : best));

for (const f of countries.features) {
  const name = f.properties.name;
  if (SKIP.has(name)) continue;
  const parts = partsOf(f);
  if (parts.length === 0) continue;

  if (SPLIT.includes(name)) {
    const seeds = TERRITORIES.filter((t) => geoContains(f, [t.lon, t.lat]));
    if (seeds.length < 2) throw new Error(`${name} should hold at least two territory points, has ${seeds.length}`);
    const points = seeds.map((t) => projection([t.lon, t.lat]) as [number, number]);
    const voronoi = Delaunay.from(points).voronoi([-2000, -2000, 4000, 4000]);
    for (const part of parts) {
      seeds.forEach((t, i) => {
        const cell = voronoi.cellPolygon(i) as [number, number][];
        for (const piece of project(part, nearSide(name))) {
          for (const poly of polygonClipping.intersection(piece, [cell])) add(t.slug, poly);
        }
      });
    }
    continue;
  }

  const slug = COUNTRY[name];
  if (!slug) {
    missing.push(`${name} (nearest: ${nearest(geoCentroid(f) as [number, number]).slug})`);
    continue;
  }
  // Far-off pieces of a country (like French Guiana) go to whatever territory they sit in.
  const largest = parts.reduce((a, b) =>
    geoArea({ type: "Polygon", coordinates: b }) > geoArea({ type: "Polygon", coordinates: a }) ? b : a,
  );
  const home = geoCentroid({ type: "Polygon", coordinates: largest });
  for (const part of parts) {
    const c = geoCentroid({ type: "Polygon", coordinates: part }) as [number, number];
    for (const piece of project(part)) add(geoDistance(c, home) > 0.4 ? nearest(c).slug : slug, piece);
  }
}

if (missing.length) {
  console.error(`Countries with no territory:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

// --- Merge, fit, and write ---------------------------------------------------

const merged = new Map<string, MultiPolygon>();
for (const t of TERRITORIES) {
  const polys = pieces.get(t.slug);
  if (!polys?.length) throw new Error(`${t.name} came out empty`);
  merged.set(t.slug, polygonClipping.union(polys[0], ...polys.slice(1)));
}

const all = [...merged.values()].flat(3) as [number, number][];
const minX = Math.min(...all.map((p) => p[0]));
const maxX = Math.max(...all.map((p) => p[0]));
const minY = Math.min(...all.map((p) => p[1]));
const maxY = Math.max(...all.map((p) => p[1]));
const PAD = 8;
const k = (WIDTH - PAD * 2) / (maxX - minX);
const height = Math.ceil((maxY - minY) * k + PAD * 2);
const fit = ([x, y]: [number, number]): [number, number] => [(x - minX) * k + PAD, (y - minY) * k + PAD];
const r1 = (n: number) => Math.round(n * 10) / 10;

function area(ring: [number, number][]) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(a / 2);
}

const shapes: Record<string, { d: string; label: [number, number]; size: number; box: number[] }> = {};
for (const [slug, multi] of merged) {
  const fitted = multi.map((poly) => poly.map((ring) => ring.map(fit)));
  const d = fitted
    .map((poly) =>
      poly
        .map((ring) => `M${ring.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}Z`)
        .join(""),
    )
    .join("");
  const biggest = fitted.reduce((a, b) => (area(b[0]) > area(a[0]) ? b : a));
  const [lx, ly] = polylabel(biggest, 0.5);
  // Size: the square root of the main landmass's area, so names can scale with the land under them.
  // Box: the main landmass's bounds, so a far-off island (Hawaii) doesn't stretch a region's view.
  const xs = biggest[0].map((p) => p[0]);
  const ys = biggest[0].map((p) => p[1]);
  shapes[slug] = {
    d,
    label: [r1(lx), r1(ly)],
    size: r1(Math.sqrt(area(biggest[0]))),
    box: [r1(Math.min(...xs)), r1(Math.min(...ys)), r1(Math.max(...xs)), r1(Math.max(...ys))],
  };
}

// The sea: the globe's outline and a 10° grid of latitude and longitude, as paths.
function linesOf(object: Parameters<typeof geoStream>[0], close: boolean) {
  const lines: [number, number][][] = [];
  let line: [number, number][] = [];
  geoStream(
    object,
    projection.stream({
      point: (x: number, y: number) => void line.push(fit([x, y])),
      lineStart: () => void (line = []),
      lineEnd: () => void (line.length > 1 && lines.push(line)),
      polygonStart: () => {},
      polygonEnd: () => {},
      sphere: () => {},
    }),
  );
  return lines.map((l) => `M${l.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}${close ? "Z" : ""}`).join("");
}
const graticule = linesOf(geoGraticule10(), false);
const sphere = linesOf({ type: "Sphere" }, true);

// Neighbors share border points. Give each territory one of four shades so no
// two neighbors match, the way printed maps tint countries next to each other.
const SHADES = 4;
const pointsOf = new Map(
  [...merged].map(([slug, multi]) => [slug, new Set(multi.flat(2).map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`))]),
);
const neighbors = new Map<string, Set<string>>(TERRITORIES.map((t) => [t.slug, new Set()]));
for (const a of TERRITORIES) {
  for (const b of TERRITORIES) {
    if (a.slug >= b.slug) continue;
    const pa = pointsOf.get(a.slug)!;
    let shared = 0;
    for (const key of pointsOf.get(b.slug)!) if (pa.has(key) && ++shared >= 2) break;
    if (shared >= 2) {
      neighbors.get(a.slug)!.add(b.slug);
      neighbors.get(b.slug)!.add(a.slug);
    }
  }
}
const shade: Record<string, number> = {};
const order = [...TERRITORIES].sort((a, b) => neighbors.get(b.slug)!.size - neighbors.get(a.slug)!.size);
// Backtracking: try each territory's shades, starting from a different one each
// time so the shades spread out, and step back whenever a territory is stuck.
function paint(i: number): boolean {
  if (i === order.length) return true;
  const t = order[i];
  for (let k = 0; k < SHADES; k++) {
    const s = (i + k) % SHADES;
    if ([...neighbors.get(t.slug)!].some((n) => shade[n] === s)) continue;
    shade[t.slug] = s;
    if (paint(i + 1)) return true;
  }
  delete shade[t.slug];
  return false;
}
if (!paint(0)) throw new Error("Couldn't shade the map without two neighbors matching");
const clashes = TERRITORIES.filter((t) => [...neighbors.get(t.slug)!].some((n) => shade[n] === shade[t.slug]));
if (clashes.length) console.warn(`Neighbors sharing a shade: ${clashes.map((t) => t.name).join(", ")}`);
for (const slug of Object.keys(shapes)) Object.assign(shapes[slug], { shade: shade[slug] });

const out = `// Generated by scripts/build-world-map.ts from Natural Earth (public domain). Don't edit by hand.

export const MAP_WIDTH = ${WIDTH};
export const MAP_HEIGHT = ${height};

/** The edge of the globe, and its grid of latitude and longitude. */
export const SPHERE = ${JSON.stringify(sphere)};
export const GRATICULE = ${JSON.stringify(graticule)};

/**
 * Each territory's outline as an SVG path, where its name sits, how big its
 * main landmass is (the square root of its area) and its bounds as
 * [x0, y0, x1, y1], and its shade (0–3) for unclaimed land, chosen so no two
 * neighbors share one.
 */
export const SHAPES: Record<
  string,
  { d: string; label: [number, number]; size: number; box: [number, number, number, number]; shade: number }
> = ${JSON.stringify(shapes, null, 2)};
`;
writeFileSync(OUT, out);
console.log(`Wrote ${OUT}: ${Object.keys(shapes).length} territories, ${WIDTH}×${height}, ${(out.length / 1024).toFixed(0)} KB`);
