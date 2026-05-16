import { APARTMENTS, type Apartment } from './apartments';

export type ApartmentTag = 'hot' | 'discount' | 'new' | 'premium';
export type BuildingStatus = 'construction' | 'ready' | 'planning';

export interface EntranceInfo {
  id: string;
  name: string; // e.g. "Entrance 1"
  floors: number;
}

export interface BuildingInfo {
  id: string; // e.g. "A-1"
  block: string;
  number: string; // raw building number "1"
  name: string;
  floors: number;
  status: BuildingStatus;
  progress: number; // 0-100
  /** SVG polygon points relative to viewBox 0 0 800 500 */
  polygon: string;
  entrances: EntranceInfo[];
}

export interface DistrictInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  deliveryDate: string;
  buildings: BuildingInfo[];
}

/* ---------- Tagged apartments (mock promo flags) ---------- */

const tagFor = (apt: Apartment): ApartmentTag | undefined => {
  if (apt.status !== 'available') return undefined;
  const n = Number(apt.number.slice(-2));
  if (n % 17 === 0) return 'hot';
  if (n % 11 === 0) return 'discount';
  if (n % 13 === 0) return 'premium';
  if (apt.floor === 16) return 'new';
  return undefined;
};

export interface ExplorerApartment extends Apartment {
  tag?: ApartmentTag;
  balcony: boolean;
  originalPrice?: number;
}

export const EXPLORER_APARTMENTS: ExplorerApartment[] = APARTMENTS.map((a) => {
  const tag = tagFor(a);
  return {
    ...a,
    tag,
    balcony: a.rooms >= 2,
    originalPrice: tag === 'discount' ? Math.round(a.price * 1.12) : undefined,
  };
});

/* ---------- Derived districts/buildings ---------- */

const buildingPolygons: Record<string, string> = {
  'A-1': '90,200 230,150 230,330 90,360',
  'A-2': '260,160 380,130 380,310 260,335',
  'B-1': '420,140 540,115 540,300 420,320',
  'B-2': '570,125 680,110 680,295 570,310',
  'C-1': '120,380 280,360 280,460 120,470',
  'C-2': '320,360 500,345 500,455 320,465',
};

const statusFor = (id: string): BuildingStatus => {
  if (id.endsWith('-2')) return 'construction';
  if (id.startsWith('C')) return 'planning';
  return 'ready';
};

const progressFor = (id: string): number => {
  const s = statusFor(id);
  if (s === 'ready') return 100;
  if (s === 'construction') return id === 'B-2' ? 65 : 80;
  return 25;
};

const grouped = EXPLORER_APARTMENTS.reduce<Record<string, Record<string, Set<string>>>>(
  (acc, a) => {
    const bId = `${a.block}-${a.building}`;
    acc[bId] ??= {};
    acc[bId][a.entrance] ??= new Set();
    acc[bId][a.entrance].add(`f${a.floor}`);
    return acc;
  },
  {},
);

export const BUILDINGS: BuildingInfo[] = Object.keys(grouped)
  .sort()
  .map((id) => {
    const [block, num] = id.split('-');
    const entrances = Object.keys(grouped[id])
      .sort()
      .map<EntranceInfo>((e) => ({
        id: e,
        name: `Entrance ${e}`,
        floors: grouped[id][e].size,
      }));
    return {
      id,
      block,
      number: num,
      name: `Building ${block}${num}`,
      floors: Math.max(...entrances.map((e) => e.floors)),
      status: statusFor(id),
      progress: progressFor(id),
      polygon: buildingPolygons[id] ?? '0,0 100,0 100,100 0,100',
      entrances,
    };
  });

export const DISTRICTS: DistrictInfo[] = [
  {
    id: 'komitas',
    name: 'New Komitas',
    tagline: 'Premium living at the heart of Yerevan',
    description:
      'A landmark residential district combining contemporary architecture, landscaped courtyards, and complete urban infrastructure.',
    deliveryDate: '2026 Q4',
    buildings: BUILDINGS,
  },
];

/* ---------- Lookups ---------- */

export const findBuilding = (id?: string | null) =>
  BUILDINGS.find((b) => b.id === id) ?? null;

export const apartmentsIn = (
  buildingId?: string | null,
  entranceId?: string | null,
  floor?: number | null,
) =>
  EXPLORER_APARTMENTS.filter((a) => {
    if (buildingId && `${a.block}-${a.building}` !== buildingId) return false;
    if (entranceId && a.entrance !== entranceId) return false;
    if (floor != null && a.floor !== floor) return false;
    return true;
  });

export const findApartment = (id?: string | null) =>
  EXPLORER_APARTMENTS.find((a) => a.id === id) ?? null;
