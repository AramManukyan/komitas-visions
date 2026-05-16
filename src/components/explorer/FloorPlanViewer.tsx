import { motion } from 'framer-motion';
import type { ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';

interface Props {
  apartments: ExplorerApartment[];
  selectedId?: string | null;
  onSelect: (apt: ExplorerApartment) => void;
}

const statusFill: Record<string, string> = {
  available: 'hsl(142 60% 60%)',
  reserved: 'hsl(40 90% 60%)',
  sold: 'hsl(0 70% 60%)',
};

/**
 * Stylized floor plan. Lays apartments out in a grid of zones.
 * Replace this with a real SVG floor plan when assets are available;
 * keep the same `apartments` + `onSelect` API.
 */
const FloorPlanViewer = ({ apartments, selectedId, onSelect }: Props) => {
  if (!apartments.length) {
    return (
      <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
        Select a floor to view its plan
      </div>
    );
  }

  const cols = Math.min(apartments.length, 3);
  const rows = Math.ceil(apartments.length / cols);
  const W = 800;
  const H = 480;
  const cellW = (W - 60) / cols;
  const cellH = (H - 60) / rows;

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-xl text-primary">Floor plan</p>
        <div className="flex gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          {(['available', 'reserved', 'sold'] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: statusFill[s] }}
              />
              {s}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        {/* corridor */}
        <rect
          x={30}
          y={H / 2 - 20}
          width={W - 60}
          height={40}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
        />

        {apartments.map((apt, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const x = 30 + c * cellW + 4;
          const y = 30 + r * cellH + 4;
          const w = cellW - 8;
          const h = cellH - 8;
          const isActive = selectedId === apt.id;
          return (
            <g
              key={apt.id}
              className={cn(
                apt.status !== 'sold' && 'cursor-pointer',
              )}
              onClick={() => apt.status !== 'sold' && onSelect(apt)}
            >
              <motion.rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={6}
                fill={statusFill[apt.status]}
                fillOpacity={isActive ? 0.95 : 0.65}
                stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'}
                strokeWidth={isActive ? 3 : 1.5}
                whileHover={{ fillOpacity: 0.9 }}
              />
              <text
                x={x + w / 2}
                y={y + 22}
                textAnchor="middle"
                style={{ fontSize: 14, fontWeight: 700, fill: 'hsl(var(--primary))' }}
              >
                №{apt.number}
              </text>
              <text
                x={x + w / 2}
                y={y + 42}
                textAnchor="middle"
                style={{ fontSize: 11, fill: 'hsl(var(--primary) / 0.8)' }}
              >
                {apt.rooms} rm · {apt.area} m²
              </text>
              {apt.tag && (
                <g>
                  <rect
                    x={x + w - 56}
                    y={y + 8}
                    width={48}
                    height={16}
                    rx={3}
                    fill="hsl(var(--primary))"
                  />
                  <text
                    x={x + w - 32}
                    y={y + 19}
                    textAnchor="middle"
                    style={{ fontSize: 9, fontWeight: 700, fill: 'hsl(var(--gold))', textTransform: 'uppercase' }}
                  >
                    {apt.tag}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default FloorPlanViewer;
