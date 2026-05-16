import { motion } from 'framer-motion';
import { BUILDINGS, type BuildingInfo } from '@/data/explorer';
import { cn } from '@/lib/utils';

interface Props {
  selectedId?: string | null;
  onSelect: (b: BuildingInfo) => void;
}

const statusColor: Record<BuildingInfo['status'], string> = {
  ready: 'hsl(var(--gold))',
  construction: 'hsl(50 70% 60%)',
  planning: 'hsl(214 20% 60%)',
};

/**
 * Stylized SVG masterplan. Building polygons use mock coordinates —
 * swap polygon `points` in src/data/explorer.ts with real SVG zones later.
 */
const Masterplan = ({ selectedId, onSelect }: Props) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-primary/95 via-primary to-primary/90 shadow-elevated">
      <svg
        viewBox="0 0 800 500"
        className="w-full h-auto block"
        role="img"
        aria-label="Residential district masterplan"
      >
        {/* ground texture */}
        <defs>
          <radialGradient id="ground" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="hsl(214 40% 25%)" />
            <stop offset="100%" stopColor="hsl(214 60% 12%)" />
          </radialGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--gold) / 0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#ground)" />
        <rect width="800" height="500" fill="url(#grid)" />

        {/* green zones */}
        <ellipse cx="400" cy="250" rx="120" ry="50" fill="hsl(140 35% 30% / 0.5)" />
        <ellipse cx="650" cy="400" rx="90" ry="40" fill="hsl(140 35% 30% / 0.4)" />

        {/* roads */}
        <path d="M0 250 H800" stroke="hsl(var(--gold) / 0.15)" strokeWidth="2" strokeDasharray="6 6" />
        <path d="M400 0 V500" stroke="hsl(var(--gold) / 0.1)" strokeWidth="2" strokeDasharray="6 6" />

        {/* buildings */}
        {BUILDINGS.map((b) => {
          const isActive = selectedId === b.id;
          return (
            <g key={b.id} className="cursor-pointer" onClick={() => onSelect(b)}>
              <motion.polygon
                points={b.polygon}
                fill={statusColor[b.status]}
                fillOpacity={isActive ? 0.95 : 0.55}
                stroke={isActive ? 'hsl(var(--gold))' : 'hsl(var(--gold) / 0.4)'}
                strokeWidth={isActive ? 3 : 1.5}
                whileHover={{ fillOpacity: 0.85 }}
                transition={{ duration: 0.2 }}
              />
              {/* label */}
              <BuildingLabel building={b} />
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
        {(['ready', 'construction', 'planning'] as const).map((s) => (
          <span
            key={s}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold',
              'bg-background/10 backdrop-blur border border-white/10 text-primary-foreground/80',
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: statusColor[s] }}
            />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

const BuildingLabel = ({ building }: { building: BuildingInfo }) => {
  const pts = building.polygon.split(' ').map((p) => p.split(',').map(Number));
  const cx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
  const cy = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
  return (
    <g pointerEvents="none">
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-heading"
        style={{
          fill: 'hsl(var(--primary))',
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {building.block}
        {building.number}
      </text>
    </g>
  );
};

export default Masterplan;
