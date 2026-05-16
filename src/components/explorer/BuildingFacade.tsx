import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { BuildingInfo, ExplorerApartment } from '@/data/explorer';

interface Props {
  building: BuildingInfo;
  entranceId: string;
  apartments: ExplorerApartment[];
  selectedFloor?: number | null;
  onSelectFloor: (floor: number) => void;
}

/**
 * Stylized SVG facade showing floors as horizontal bands.
 * Color reflects availability share. Click a floor to drill in.
 */
const BuildingFacade = ({
  building,
  entranceId,
  apartments,
  selectedFloor,
  onSelectFloor,
}: Props) => {
  const floors = useMemo(() => {
    const ent = building.entrances.find((e) => e.id === entranceId);
    const count = ent?.floors ?? building.floors;
    return Array.from({ length: count }, (_, i) => count - i); // top → bottom
  }, [building, entranceId]);

  const byFloor = useMemo(() => {
    const m = new Map<number, ExplorerApartment[]>();
    apartments
      .filter((a) => a.entrance === entranceId)
      .forEach((a) => {
        const list = m.get(a.floor) ?? [];
        list.push(a);
        m.set(a.floor, list);
      });
    return m;
  }, [apartments, entranceId]);

  const W = 320;
  const H = 520;
  const floorH = (H - 60) / floors.length;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-soft p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 font-semibold">
        {building.name} · Entrance {entranceId}
      </p>
      <p className="font-heading text-2xl text-primary mb-3">
        {floors.length} floors
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        {/* roof */}
        <polygon
          points={`20,40 ${W - 20},40 ${W - 50},10 50,10`}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--gold) / 0.4)"
        />

        {/* floors */}
        {floors.map((f, i) => {
          const y = 50 + i * floorH;
          const apts = byFloor.get(f) ?? [];
          const available = apts.filter((a) => a.status === 'available').length;
          const isActive = selectedFloor === f;
          const fill =
            available === 0
              ? 'hsl(214 25% 75%)'
              : available === apts.length
                ? 'hsl(var(--gold))'
                : 'hsl(50 70% 75%)';
          return (
            <g
              key={f}
              className="cursor-pointer"
              onClick={() => onSelectFloor(f)}
            >
              <motion.rect
                x={20}
                y={y}
                width={W - 40}
                height={floorH - 4}
                fill={fill}
                fillOpacity={isActive ? 1 : 0.7}
                stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.2)'}
                strokeWidth={isActive ? 2 : 1}
                rx={3}
                whileHover={{ fillOpacity: 0.95 }}
              />
              {/* windows hint */}
              {Array.from({ length: 4 }).map((_, k) => (
                <rect
                  key={k}
                  x={40 + k * ((W - 80) / 4)}
                  y={y + 4}
                  width={(W - 80) / 4 - 8}
                  height={floorH - 14}
                  fill="hsl(var(--primary) / 0.5)"
                  rx={1}
                />
              ))}
              <text
                x={W - 28}
                y={y + floorH / 2}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--primary))' }}
              >
                {f}
              </text>
              <text
                x={28}
                y={y + floorH / 2}
                dominantBaseline="middle"
                style={{ fontSize: 9, fill: 'hsl(var(--primary))', fontWeight: 600 }}
              >
                {available}/{apts.length}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        Click a floor to view its apartments
      </p>
    </div>
  );
};

export default BuildingFacade;
