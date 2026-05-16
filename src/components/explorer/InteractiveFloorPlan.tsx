import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ExplorerApartment } from '@/data/explorer';
import { getFloorGeometry } from '@/data/geometry';
import InteractiveSvg, { type InteractiveSvgHandle } from './InteractiveSvg';

interface Props {
  buildingId: string;
  entrance: string;
  floor: number;
  apartments: ExplorerApartment[];
  selectedId?: string | null;
  onSelect: (apt: ExplorerApartment) => void;
}

const statusFill: Record<string, string> = {
  available: 'hsl(142 60% 60%)',
  reserved: 'hsl(40 90% 60%)',
  sold: 'hsl(0 70% 60%)',
};

const fmtPrice = (p: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(p);

const InteractiveFloorPlan = ({
  buildingId,
  entrance,
  floor,
  apartments,
  selectedId,
  onSelect,
}: Props) => {
  const geometry = getFloorGeometry(buildingId, entrance, floor);
  const svgRef = useRef<InteractiveSvgHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, ExplorerApartment>();
    apartments.forEach((a) => m.set(a.id, a));
    return m;
  }, [apartments]);

  // zoom-to-apartment when selected
  useEffect(() => {
    if (!geometry) return;
    if (!selectedId) {
      svgRef.current?.reset();
      return;
    }
    const zone = geometry.zones.find((z) => z.id === selectedId);
    if (zone?.bbox) {
      svgRef.current?.zoomToBox(zone.bbox.cx, zone.bbox.cy, zone.bbox.w, zone.bbox.h, 2.5);
    }
  }, [selectedId, geometry]);

  if (!geometry) {
    return (
      <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
        Floor plan not available
      </div>
    );
  }

  const hovered = hoverId ? byId.get(hoverId) : null;

  return (
    <div ref={containerRef} className="relative rounded-3xl border border-border bg-card shadow-soft p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="font-heading text-xl text-primary">
          Floor {floor} · Entrance {entrance}
        </p>
        <div className="flex gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          {(['available', 'reserved', 'sold'] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: statusFill[s] }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      <InteractiveSvg
        ref={svgRef}
        viewBox={geometry.viewBox}
        backgroundSrc={geometry.backgroundSrc}
        backgroundMarkup={geometry.backgroundMarkup}
        className="aspect-[5/3]"
      >
        {geometry.zones.map((zone) => {
          const apt = byId.get(zone.id);
          if (!apt) return null;
          const isActive = selectedId === apt.id;
          const isHover = hoverId === apt.id;
          const clickable = apt.status !== 'sold';
          const common = {
            fill: statusFill[apt.status],
            fillOpacity: isActive ? 0.95 : isHover ? 0.85 : 0.55,
            stroke: isActive || isHover ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)',
            strokeWidth: isActive ? 3 : isHover ? 2 : 1.5,
          };
          return (
            <g
              key={zone.id}
              className={clickable ? 'cursor-pointer' : 'cursor-not-allowed'}
              onPointerEnter={(e) => {
                setHoverId(zone.id);
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onPointerMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onPointerLeave={() => {
                setHoverId((h) => (h === zone.id ? null : h));
                setTooltipPos(null);
              }}
              onClick={() => clickable && onSelect(apt)}
            >
              {zone.points ? (
                <motion.polygon points={zone.points} rx={6} {...common} />
              ) : zone.path ? (
                <motion.path d={zone.path} {...common} />
              ) : null}
              {zone.bbox && (
                <>
                  <text
                    x={zone.bbox.cx}
                    y={zone.bbox.cy - 6}
                    textAnchor="middle"
                    pointerEvents="none"
                    style={{ fontSize: 14, fontWeight: 700, fill: 'hsl(var(--primary))' }}
                  >
                    №{apt.number}
                  </text>
                  <text
                    x={zone.bbox.cx}
                    y={zone.bbox.cy + 12}
                    textAnchor="middle"
                    pointerEvents="none"
                    style={{ fontSize: 11, fill: 'hsl(var(--primary) / 0.85)' }}
                  >
                    {apt.rooms} rm · {apt.area} m²
                  </text>
                </>
              )}
            </g>
          );
        })}
      </InteractiveSvg>

      {/* floating tooltip */}
      {hovered && tooltipPos && (
        <div
          className="pointer-events-none absolute z-20 rounded-xl bg-background/95 backdrop-blur border border-border shadow-soft px-3 py-2 text-xs min-w-[160px]"
          style={{
            left: Math.min(tooltipPos.x + 14, (containerRef.current?.clientWidth ?? 9999) - 180),
            top: Math.max(tooltipPos.y - 70, 8),
          }}
        >
          <p className="font-heading text-sm text-primary">Apt №{hovered.number}</p>
          <p className="text-muted-foreground">
            {hovered.rooms} rooms · {hovered.area} m²
          </p>
          <p className="text-primary font-semibold mt-1">{fmtPrice(hovered.price)} ֏</p>
          <p className="text-[10px] uppercase tracking-wider mt-1 capitalize text-muted-foreground">
            {hovered.status}
            {hovered.tag ? ` · ${hovered.tag}` : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default InteractiveFloorPlan;
