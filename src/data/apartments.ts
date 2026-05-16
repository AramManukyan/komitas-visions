export type ApartmentStatus = 'available' | 'reserved' | 'sold';

export interface Apartment {
  id: string;
  number: string;
  block: string;       // e.g. "A"
  building: string;    // e.g. "1"
  entrance: string;    // e.g. "1"
  floor: number;
  rooms: number;
  area: number;        // m²
  price: number;       // AMD
  status: ApartmentStatus;
}

const BLOCKS = ['A', 'B', 'C'] as const;
const BUILDINGS_PER_BLOCK = 2;
const ENTRANCES_PER_BUILDING = 2;
const FLOORS = 16;
const APTS_PER_FLOOR = 2;

const seed = (n: number) => {
  // deterministic pseudo-random for stable mock data
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const STATUSES: ApartmentStatus[] = ['available', 'available', 'available', 'reserved', 'sold'];

export const APARTMENTS: Apartment[] = (() => {
  const list: Apartment[] = [];
  let counter = 0;
  BLOCKS.forEach((block) => {
    for (let bld = 1; bld <= BUILDINGS_PER_BLOCK; bld++) {
      for (let ent = 1; ent <= ENTRANCES_PER_BUILDING; ent++) {
        for (let floor = 1; floor <= FLOORS; floor++) {
          // Variable apartments per floor: 2–6, deterministic per building+entrance+floor
          const floorSeed = seed(floor * 31 + ent * 7 + bld * 13 + block.charCodeAt(0));
          const aptsThisFloor = 2 + Math.floor(floorSeed * 5); // 2..6
          for (let i = 0; i < aptsThisFloor; i++) {
            counter++;
            const r = seed(counter);
            const rooms = [1, 2, 2, 3, 3, 4][Math.floor(r * 6)];
            const area = Math.round(35 + rooms * 18 + r * 12);
            const price = Math.round((area * (820_000 + r * 220_000)) / 1000) * 1000;
            const status = STATUSES[Math.floor(seed(counter + 7) * STATUSES.length)];
            list.push({
              id: `${block}-${bld}-${ent}-${floor}-${i + 1}`,
              number: `${block}${bld}${ent}${String(floor).padStart(2, '0')}${i + 1}`,
              block,
              building: String(bld),
              entrance: String(ent),
              floor,
              rooms,
              area,
              price,
              status,
            });
          }
        }
      }
    }
  });
  return list;
})();

export const BLOCK_OPTIONS = [...BLOCKS];
