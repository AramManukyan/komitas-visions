/**
 * CMS / API-ready geometry layer for the apartment explorer.
 *
 * Two registries:
 *   • MASTERPLAN_GEOMETRY — one record per district. Background SVG/image plus
 *     polygon zones tied to building ids.
 *   • FLOOR_GEOMETRY      — one record per (building, entrance, floor). Background
 *     SVG/image plus polygon zones tied to apartment ids.
 *
 * Real assets can later be loaded by replacing the in-memory registries with
 * a fetch from a CMS — the interactive components only depend on the shape
 * defined here, not on the source.
 */
import { BUILDINGS, EXPLORER_APARTMENTS } from './explorer';

export interface SvgZone {
  /** Stable id used to map a zone to a domain entity (building / apartment). */
  id: string;
  /** Polygon points "x1,y1 x2,y2 ..." OR an SVG path "d" string. */
  points?: string;
  path?: string;
  /** Optional bbox cache (cx, cy, w, h) for smooth zoom + label placement. */
  bbox?: { cx: number; cy: number; w: number; h: number };
  /** Free-form metadata for tooltips. */
  meta?: Record<string, string | number | undefined>;
}

export interface SvgGeometry {
  /** viewBox of the background plate. */
  viewBox: string;
  /** Optional rasterised/vector background (URL). */
  backgroundSrc?: string;
  /** Inline SVG snippet used as a stylised placeholder when no asset exists. */
  backgroundMarkup?: string;
  zones: SvgZone[];
}

/* ------------------------------------------------------------------ */
/* Masterplan                                                          */
/* ------------------------------------------------------------------ */

const masterplanBackground = /* svg */ `
  <defs>
    <radialGradient id="mp-ground" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="hsl(214, 40%, 25%)"/>
      <stop offset="100%" stop-color="hsl(214, 60%, 12%)"/>
    </radialGradient>
    <pattern id="mp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(45, 80%, 60%, 0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#mp-ground)"/>
  <rect width="800" height="500" fill="url(#mp-grid)"/>
  <ellipse cx="400" cy="250" rx="120" ry="50" fill="hsl(140, 35%, 30%, 0.5)"/>
  <ellipse cx="650" cy="400" rx="90" ry="40" fill="hsl(140, 35%, 30%, 0.4)"/>
  <path d="M0 250 H800" stroke="hsl(45, 80%, 60%, 0.15)" stroke-width="2" stroke-dasharray="6 6"/>
  <path d="M400 0 V500" stroke="hsl(45, 80%, 60%, 0.10)" stroke-width="2" stroke-dasharray="6 6"/>
`;

const bboxOfPoints = (points: string) => {
  const coords = points
    .trim()
    .split(/\s+/)
    .map((p) => p.split(',').map(Number));
  const xs = coords.map(([x]) => x);
  const ys = coords.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: maxX - minX,
    h: maxY - minY,
  };
};

import masterplanImg from '@/assets/explorer-masterplan.jpg';

export const MASTERPLAN_GEOMETRY: Record<string, SvgGeometry> = {
  komitas: {
    viewBox: '0 0 1600 900',
    backgroundSrc: masterplanImg,
    backgroundMarkup: masterplanBackground,
    zones: BUILDINGS.map((b) => ({
      id: b.id,
      points: b.polygon,
      bbox: bboxOfPoints(b.polygon),
      meta: { name: b.name, status: b.status, progress: b.progress },
    })),
  },
};

/* ------------------------------------------------------------------ */
/* Floor plans                                                         */
/* ------------------------------------------------------------------ */

/** Key helper: building-entrance-floor → geometry. */
export const floorKey = (buildingId: string, entrance: string, floor: number) =>
  `${buildingId}::${entrance}::${floor}`;

const floorBackground = /* svg */ `
  <defs>
    <pattern id="fp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(214, 30%, 50%, 0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="480" fill="hsl(40, 30%, 96%)"/>
  <rect width="800" height="480" fill="url(#fp-grid)"/>
  <!-- corridor -->
  <rect x="30" y="220" width="740" height="40" fill="hsl(40, 25%, 88%)" stroke="hsl(214, 20%, 70%)"/>
  <!-- stairwell -->
  <rect x="370" y="225" width="60" height="30" fill="hsl(214, 20%, 80%)" stroke="hsl(214, 25%, 55%)"/>
  <line x1="370" y1="240" x2="430" y2="240" stroke="hsl(214, 25%, 55%)"/>
`;

/** Procedurally arrange apartments on a floor plate; CMS would supply real points. */
const buildFloorZones = (apartments: typeof EXPLORER_APARTMENTS): SvgZone[] => {
  const W = 800;
  const H = 480;
  const cols = Math.min(apartments.length, 3);
  const rows = Math.ceil(apartments.length / cols);
  const cellW = (W - 60) / cols;
  const cellH = (H - 60) / rows;
  return apartments.map((apt, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = 30 + c * cellW + 8;
    const y = 30 + r * cellH + 8;
    const w = cellW - 16;
    const h = cellH - 16;
    const points = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
    return {
      id: apt.id,
      points,
      bbox: { cx: x + w / 2, cy: y + h / 2, w, h },
      meta: {
        number: apt.number,
        rooms: apt.rooms,
        area: apt.area,
        status: apt.status,
        tag: apt.tag,
      },
    };
  });
};

export const FLOOR_GEOMETRY: Record<string, SvgGeometry> = (() => {
  const map: Record<string, SvgGeometry> = {};
  BUILDINGS.forEach((b) => {
    b.entrances.forEach((e) => {
      for (let f = 1; f <= e.floors; f++) {
        const apts = EXPLORER_APARTMENTS.filter(
          (a) =>
            `${a.block}-${a.building}` === b.id &&
            a.entrance === e.id &&
            a.floor === f,
        );
        if (!apts.length) continue;
        map[floorKey(b.id, e.id, f)] = {
          viewBox: '0 0 800 480',
          backgroundMarkup: floorBackground,
          zones: buildFloorZones(apts),
        };
      }
    });
  });
  return map;
})();

export const getMasterplanGeometry = (districtId: string) =>
  MASTERPLAN_GEOMETRY[districtId] ?? null;

export const getFloorGeometry = (
  buildingId: string,
  entrance: string,
  floor: number,
) => FLOOR_GEOMETRY[floorKey(buildingId, entrance, floor)] ?? null;
