import { cn } from '@/lib/utils';
import { Compass } from 'lucide-react';

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
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-border bg-background shadow-sm" />

        {/* Cardinal labels */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <text
            x="50"
            y="13"
            textAnchor="middle"
            className="fill-[hsl(var(--primary))] text-[16px] font-bold"
          >
            N
          </text>
          <text
            x="88"
            y="55"
            textAnchor="middle"
            className="fill-muted-foreground text-[12px] font-semibold"
          >
            E
          </text>
          <text
            x="50"
            y="93"
            textAnchor="middle"
            className="fill-muted-foreground text-[12px] font-semibold"
          >
            S
          </text>
          <text
            x="12"
            y="55"
            textAnchor="middle"
            className="fill-muted-foreground text-[12px] font-semibold"
          >
            W
          </text>
        </svg>

        {/* Inner hub */}
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-10" />

        {/* Rotating needle (origin at bottom center of the needle element) */}
        <div
          className="absolute left-1/2 top-1/2 w-[2px] -translate-x-1/2 origin-bottom transition-transform duration-500 ease-out"
          style={{
            height: '45%',
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          }}
        >
          <div className="h-full w-full rounded-full bg-gradient-to-t from-accent-foreground/80 to-accent" />
        </div>

        {/* Counter-weight tail */}
        <div
          className="absolute left-1/2 top-1/2 w-[2px] origin-top transition-transform duration-500 ease-out"
          style={{
            height: '25%',
            transform: `translate(-50%, 0%) rotate(${angle + 180}deg)`,
          }}
        >
          <div className="h-full w-full rounded-full bg-muted-foreground/40" />
        </div>

        {/* Decorative background icon */}
        <Compass
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/15',
            compact ? 'h-4 w-4' : 'h-4 w-4 md:h-5 md:w-5',
          )}
        />
      </div>

      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold mb-0.5">
          {label ?? 'Orientation'}
        </p>
        <p className={cn('font-heading font-bold text-primary leading-tight', compact ? 'text-sm' : 'text-base md:text-lg')}>
          {value ?? orientation}
        </p>
      </div>
    </div>
  );
};

export default OrientationCompass;


