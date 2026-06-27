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
  className?: string;
}

export const OrientationCompass = ({ orientation, label, className }: OrientationCompassProps) => {
  if (!orientation) return null;

  const angle = ORIENTATION_ANGLES[orientation];

  return (
    <div className={cn('rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-4', className)}>
      <div
        className="relative h-16 w-16 md:h-20 md:w-20 shrink-0"
        aria-label={`Compass pointing ${orientation}`}
        role="img"
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-border bg-card shadow-sm" />

        {/* Cardinal tick marks */}
        <div className="absolute inset-0">
          {(['N', 'E', 'S', 'W'] as const).map((dir) => (
            <span
              key={dir}
              className={cn(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-bold tracking-wider',
                dir === orientation || orientation.includes(dir)
                  ? 'text-accent-foreground'
                  : 'text-muted-foreground',
              )}
              style={{
                transform: `translate(-50%, -50%) rotate(${dir === 'N' ? 0 : dir === 'E' ? 90 : dir === 'S' ? 180 : 270}deg) translateY(-5.5rem)`,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: `rotate(${dir === 'N' ? 0 : dir === 'E' ? -90 : dir === 'S' ? -180 : -270}deg)`,
                }}
              >
                {dir}
              </span>
            </span>
          ))}
        </div>

        {/* Inner hub */}
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-10" />

        {/* Rotating needle */}
        <div
          className="absolute left-1/2 top-1/2 h-[55%] w-1.5 -translate-x-1/2 -translate-y-1/2 origin-bottom transition-transform duration-500 ease-out"
          style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
        >
          <div className="h-full w-full rounded-full bg-gradient-to-t from-accent-foreground/80 via-accent to-accent" />
        </div>

        {/* Secondary tail */}
        <div
          className="absolute left-1/2 top-1/2 h-[35%] w-1 -translate-x-1/2 origin-top transition-transform duration-500 ease-out"
          style={{ transform: `translate(-50%, 0%) rotate(${angle + 180}deg)` }}
        >
          <div className="h-full w-full rounded-full bg-muted-foreground/40" />
        </div>

        {/* Center decorative icon */}
        <Compass className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/20" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
          {label ?? 'Orientation'}
        </p>
        <p className="font-heading text-2xl md:text-3xl font-bold text-primary leading-tight">
          {orientation}
        </p>
      </div>
    </div>
  );
};

export default OrientationCompass;
