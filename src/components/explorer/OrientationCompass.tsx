import { cn } from '@/lib/utils';

export type Orientation = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

const ORIENTATION_ANGLES: Record<Orientation, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

interface OrientationCompassProps {
  orientation?: Orientation | null;
  label?: string;
  value?: string;
  className?: string;
  compact?: boolean;
}

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

export const OrientationCompass = ({
  orientation,
  label,
  value,
  className,
  compact = false,
}: OrientationCompassProps) => {
  if (!orientation) return null;

  const angle = ORIENTATION_ANGLES[orientation];

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card flex items-center gap-3 self-start',
        compact ? 'p-2 gap-2' : 'p-3 md:p-3.5 gap-3',
        className,
      )}
    >
      <div
        className={cn(
          'relative shrink-0',
          compact ? 'h-9 w-9' : 'h-11 w-11 md:h-12 md:w-12',
        )}
        aria-label={`Compass pointing ${value ?? orientation}`}
        role="img"
      >
        <svg className="h-full w-full" viewBox="0 0 100 100">
          {/* Warm compass face with brass bezel */}
          <circle
            cx="50"
            cy="50"
            r="48"
            className="fill-amber-50/50 stroke-amber-300"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="fill-none stroke-muted-foreground/20"
            strokeWidth="1"
          />

          {/* Degree tick marks */}
          {TICKS.map((deg) => {
            const isCardinal = deg % 90 === 0;
            const isSemiCardinal = deg % 45 === 0 && !isCardinal;
            const length = isCardinal ? 10 : isSemiCardinal ? 6 : 4;
            const strokeWidth = isCardinal ? 2.5 : 1;
            const rad = (deg * Math.PI) / 180;
            const r1 = 41;
            const r2 = r1 - length;
            const x1 = 50 + r1 * Math.cos(rad);
            const y1 = 50 + r1 * Math.sin(rad);
            const x2 = 50 + r2 * Math.cos(rad);
            const y2 = 50 + r2 * Math.sin(rad);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={isCardinal ? 'stroke-red-500' : 'stroke-muted-foreground/40'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          })}

          {/* Cardinal labels — N highlighted red, S blue, E/W muted */}
          <text
            x="50"
            y="23"
            textAnchor="middle"
            className="fill-red-500 text-[15px] font-bold"
          >
            N
          </text>
          <text
            x="82"
            y="55"
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-semibold"
          >
            E
          </text>
          <text
            x="50"
            y="90"
            textAnchor="middle"
            className="fill-blue-500 text-[11px] font-semibold"
          >
            S
          </text>
          <text
            x="18"
            y="55"
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] font-semibold"
          >
            W
          </text>

          {/* Rotating compass needle: red north, blue south */}
          <g transform={`rotate(${angle}, 50, 50)`}>
            <path d="M50 5 L55 50 L45 50 Z" className="fill-red-500" />
            <path d="M50 75 L55 50 L45 50 Z" className="fill-blue-500" />
            <circle
              cx="50"
              cy="50"
              r="4"
              className="fill-background stroke-amber-400"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>

      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold mb-0.5">
          {label ?? 'Orientation'}
        </p>
        <p
          className={cn(
            'font-heading font-bold text-primary leading-tight break-words',
            compact ? 'text-sm' : 'text-base md:text-lg',
          )}
        >
          {value ?? orientation}
        </p>
      </div>
    </div>
  );
};

export default OrientationCompass;
