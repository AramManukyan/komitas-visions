import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BUILDINGS,
  EXPLORER_APARTMENTS,
  type BuildingInfo,
  type BuildingStatus,
} from '@/data/explorer';
import { getMasterplanGeometry } from '@/data/geometry';
import InteractiveSvg, { type InteractiveSvgHandle } from './InteractiveSvg';
import { cn } from '@/lib/utils';

interface Props {
  districtId?: string;
  selectedId?: string | null;
  onSelect: (b: BuildingInfo) => void;
}

const statusColor: Record<BuildingStatus, string> = {
  ready: 'hsl(var(--gold))',
  construction: 'hsl(50 70% 60%)',
  planning: 'hsl(214 20% 60%)',
};

/** Real-asset-ready masterplan. Geometry comes from /data/geometry.ts. */
const InteractiveMasterplan = ({
  districtId = 'komitas',
  selectedId,
  onSelect,
}: Props) => {
  const geometry = getMasterplanGeometry(districtId);
  const svgRef = useRef<InteractiveSvgHandle>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  /** availability per building */
  const availability = useMemo(() => {
    const m = new Map<string, { available: number; total: number }>();
    EXPLORER_APARTMENTS.forEach((a) => {
      const id = `${a.block}-${a.building}`;
      const cur = m.get(id) ?? { available: 0, total: 0 };
      cur.total += 1;
      if (a.status === 'available') cur.available += 1;
      m.set(id, cur);
    });
    return m;
  }, []);

  /** smooth zoom to selected building */
  useEffect(() => {
    if (!geometry) return;
    if (!selectedId) {
      svgRef.current?.reset();
      return;
    }
    const zone = geometry.zones.find((z) => z.id === selectedId);
    if (zone?.bbox) {
      svgRef.current?.zoomToBox(zone.bbox.cx, zone.bbox.cy, zone.bbox.w, zone.bbox.h, 2.2);
    }
  }, [selectedId, geometry]);

  if (!geometry) return null;

  const hovered = BUILDINGS.find((b) => b.id === hoverId);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border bg-primary shadow-elevated">
      <InteractiveSvg
        ref={svgRef}
        viewBox={geometry.viewBox}
        backgroundSrc={geometry.backgroundSrc}
        backgroundMarkup={geometry.backgroundMarkup}
        className="aspect-[8/5]"
      >
        {geometry.zones.map((zone) => {
          const building = BUILDINGS.find((b) => b.id === zone.id);
          if (!building) return null;
          const isActive = selectedId === zone.id;
          const isHover = hoverId === zone.id;
          return (
            <g
              key={zone.id}
              className="cursor-pointer"
              onPointerEnter={() => setHoverId(zone.id)}
              onPointerLeave={() => setHoverId((h) => (h === zone.id ? null : h))}
              onClick={() => onSelect(building)}
            >
              {zone.points ? (
                <motion.polygon
                  points={zone.points}
                  fill={statusColor[building.status]}
                  fillOpacity={isActive ? 0.95 : isHover ? 0.85 : 0.55}
                  stroke={isActive || isHover ? 'hsl(var(--gold))' : 'hsl(var(--gold) / 0.4)'}
                  strokeWidth={isActive ? 3 : isHover ? 2 : 1.5}
                  transition={{ duration: 0.2 }}
                />
              ) : zone.path ? (
                <motion.path
                  d={zone.path}
                  fill={statusColor[building.status]}
                  fillOpacity={isActive ? 0.95 : isHover ? 0.85 : 0.55}
                  stroke={isActive || isHover ? 'hsl(var(--gold))' : 'hsl(var(--gold) / 0.4)'}
                  strokeWidth={isActive ? 3 : isHover ? 2 : 1.5}
                />
              ) : null}
              {zone.bbox && (
                <text
                  x={zone.bbox.cx}
                  y={zone.bbox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  className="font-heading"
                  style={{
                    fill: 'hsl(var(--primary))',
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  {building.block}
                  {building.number}
                </text>
              )}
            </g>
          );
        })}
      </InteractiveSvg>

      {/* hover preview */}
      {hovered && (
        <div className="pointer-events-none absolute top-3 left-3 rounded-xl bg-background/90 backdrop-blur border border-border shadow-soft px-3 py-2 text-xs">
          <p className="font-heading text-sm text-primary">{hovered.name}</p>
          <p className="text-muted-foreground capitalize">
            {hovered.status} · {hovered.progress}%
          </p>
          <p className="text-primary font-semibold mt-0.5">
            {availability.get(hovered.id)?.available ?? 0}/
            {availability.get(hovered.id)?.total ?? 0} available
          </p>
        </div>
      )}

      {/* legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {(['ready', 'construction', 'planning'] as const).map((s) => (
          <span
            key={s}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold',
              'bg-background/10 backdrop-blur border border-white/10 text-primary-foreground/80',
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: statusColor[s] }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

export default InteractiveMasterplan;
