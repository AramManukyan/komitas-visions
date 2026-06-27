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
}

export const OrientationCompass = ({ orientation, label, value, className }: OrientationCompassProps) => {
  if (!orientation) return null;

  const angle = ORIENTATION_ANGLES[orientation];

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3 md:p-4 flex items-center gap-3 md:gap-4 self-start',
        className,
      )}
    >
      <div
        className="relative h-14 w-14 md:h-16 md:w-16 shrink-0"
        aria-label={`Compass pointing ${value ?? orientation}`}
        role="img"
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-border bg-background shadow-sm" />

        {/* Cardinal labels */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <text
            x="50"
            y="12"
            textAnchor="middle"
            className="fill-[hsl(var(--primary))] text-[18px] font-bold"
          >
            N
          </text>
          <text
            x="88"
            y="54"
            textAnchor="middle"
            className="fill-muted-foreground text-[14px] font-semibold"
          >
            E
          </text>
          <text
            x="50"
            y="92"
            textAnchor="middle"
            className="fill-muted-foreground text-[14px] font-semibold"
          >
            S
          </text>
          <text
            x="12"
            y="54"
            textAnchor="middle"
            className="fill-muted-foreground text-[14px] font-semibold"
          >
            W
          </text>
        </svg>

        {/* Inner hub */}
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-10" />

        {/* Rotating needle (origin at bottom center of the needle element) */}
        <div
          className="absolute left-1/2 top-1/2 w-[2px] md:w-[3px] -translate-x-1/2 origin-bottom transition-transform duration-500 ease-out"
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
        <Compass className="absolute left-1/2 top-1/2 h-5 w-5 md:h-6 md:w-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/15" />
      </div>

      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold mb-0.5">
          {label ?? 'Orientation'}
        </p>
        <p className="font-heading text-xl md:text-2xl font-bold text-primary leading-tight">
          {value ?? orientation}
        </p>
      </div>
    </div>
  );
};

export default OrientationCompass;


