import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Inbox } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BUILDINGS, EXPLORER_APARTMENTS, type ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';

export interface MatrixFilter {
  unitType: string; // "all" or "1"|"2"|"3"|"4"
  areaBucket: string; // "all" or "min-max"
  floorBucket: string; // "all" or "min-max"
}

interface Props {
  selectedBuildingId: string | null;
  filter: MatrixFilter;
  onApartmentClick: (apt: ExplorerApartment) => void;
  isFavorite: (id: string) => boolean;
}

const STATUS_CELL: Record<string, string> = {
  available:
    'bg-[hsl(var(--status-available))] text-[hsl(var(--status-available-fg))] hover:brightness-110',
  reserved:
    'bg-[hsl(var(--status-reserved))] text-[hsl(var(--status-reserved-fg))] hover:brightness-110',
  sold: 'bg-[hsl(var(--status-sold))] text-[hsl(var(--status-sold-fg))]',
};

const LEGEND = [
  { key: 'available' as const, label: 'available', cls: 'bg-[hsl(var(--status-available))]' },
  { key: 'reserved' as const, label: 'reserved', cls: 'bg-[hsl(var(--status-reserved))]' },
  { key: 'sold' as const, label: 'sold', cls: 'bg-[hsl(var(--status-sold))]' },
];

const matchesFilter = (apt: ExplorerApartment, f: MatrixFilter) => {
  if (f.unitType !== 'all' && String(apt.rooms) !== f.unitType) return false;
  if (f.areaBucket !== 'all') {
    const [min, max] = f.areaBucket.split('-').map(Number);
    if (apt.area < min || apt.area > max) return false;
  }
  if (f.floorBucket !== 'all') {
    const [min, max] = f.floorBucket.split('-').map(Number);
    if (apt.floor < min || apt.floor > max) return false;
  }
  return true;
};

const BuildingMatrix = ({
  selectedBuildingId,
  filter,
  onApartmentClick,
  isFavorite,
}: Props) => {
  const visibleBuildings = useMemo(
    () => (selectedBuildingId ? BUILDINGS.filter((b) => b.id === selectedBuildingId) : BUILDINGS),
    [selectedBuildingId],
  );

  const maxFloors = useMemo(
    () => Math.max(...visibleBuildings.map((b) => b.floors)),
    [visibleBuildings],
  );
  const floorRows = Array.from({ length: maxFloors }, (_, i) => maxFloors - i);

  // Compute counts honoring building + filters
  const counts = useMemo(() => {
    const c = { available: 0, reserved: 0, sold: 0 };
    EXPLORER_APARTMENTS.forEach((a) => {
      if (selectedBuildingId && `${a.block}-${a.building}` !== selectedBuildingId) return;
      if (!matchesFilter(a, filter)) return;
      c[a.status] += 1;
    });
    return c;
  }, [selectedBuildingId, filter]);

  const totalMatching = counts.available + counts.reserved + counts.sold;
  const gridRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation: arrow keys move focus between [data-cell] buttons
  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const root = gridRef.current;
    if (!root) return;
    const cells = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cell="1"]'));
    const active = document.activeElement as HTMLElement | null;
    const idx = cells.findIndex((c) => c === active);
    if (idx < 0) return;
    e.preventDefault();
    const cur = cells[idx].getBoundingClientRect();
    let best = -1;
    let bestDist = Infinity;
    cells.forEach((c, i) => {
      if (i === idx) return;
      const r = c.getBoundingClientRect();
      const dx = r.left - cur.left;
      const dy = r.top - cur.top;
      const horizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
      const dir =
        e.key === 'ArrowRight' ? dx > 4 :
        e.key === 'ArrowLeft' ? dx < -4 :
        e.key === 'ArrowDown' ? dy > 4 :
        dy < -4;
      if (!dir) return;
      const dist = horizontal ? Math.abs(dx) + Math.abs(dy) * 3 : Math.abs(dy) + Math.abs(dx) * 3;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best >= 0) cells[best].focus();
  };

  return (
    <TooltipProvider delayDuration={120}>
      {/* Legend + counts */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {LEGEND.map((l) => (
            <div
              key={l.key}
              className="flex items-center gap-2 text-xs font-medium text-foreground/80"
            >
              <span className={cn('h-3.5 w-3.5 rounded-sm', l.cls)} />
              {l.label}
              <span className="text-muted-foreground tabular-nums">· {counts[l.key]}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{totalMatching}</span> matching units
        </div>
      </div>

      {totalMatching === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 grid place-items-center text-center">
          <div className="h-16 w-16 rounded-full bg-muted grid place-items-center mb-3">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-heading text-lg text-primary">No matching apartments</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try widening your filters or pick another building.
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          onKeyDown={handleKeyNav}
          className="flex gap-3 items-start overflow-x-auto pb-4"
        >
          {/* Floor numbers column */}
          <div className="flex flex-col gap-1 pt-16 shrink-0 sticky left-0 bg-warm-bg z-10">
            {floorRows.map((f) => (
              <div
                key={f}
                className="h-6 sm:h-7 w-6 sm:w-8 grid place-items-center text-[10px] sm:text-[11px] font-semibold text-muted-foreground bg-muted/50 rounded"
              >
                {f}
              </div>
            ))}
          </div>

          {visibleBuildings.map((building) => (
            <div key={building.id} className="shrink-0">
              {/* Header with progress */}
              <div className="mb-2 text-center">
                <div className="text-sm font-bold text-foreground">
                  {building.block} / {building.number}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {building.status === 'ready'
                    ? 'Ready'
                    : `${building.status} · ${building.progress}%`}
                </div>
                <div className="h-1 w-full max-w-[120px] mx-auto mt-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${building.progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn(
                      'h-full',
                      building.status === 'ready'
                        ? 'bg-[hsl(var(--status-available))]'
                        : 'bg-[hsl(var(--status-reserved))]',
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {building.entrances.map((entrance) => {
                  const aptsByFloor = new Map<number, ExplorerApartment[]>();
                  EXPLORER_APARTMENTS.forEach((a) => {
                    if (`${a.block}-${a.building}` !== building.id) return;
                    if (a.entrance !== entrance.id) return;
                    const arr = aptsByFloor.get(a.floor) ?? [];
                    arr.push(a);
                    aptsByFloor.set(a.floor, arr);
                  });
                  const maxUnits = Math.max(
                    1,
                    ...Array.from(aptsByFloor.values()).map((arr) => arr.length),
                  );
                  return (
                    <div key={entrance.id} className="flex flex-col gap-1">
                      <div className="h-7 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                        {entrance.id}
                      </div>
                      {floorRows.map((floor) => {
                        const apts = (aptsByFloor.get(floor) ?? []).sort((a, b) =>
                          a.number.localeCompare(b.number),
                        );
                        return (
                          <div key={floor} className="flex gap-0.5 h-6 sm:h-7">
                            {Array.from({ length: maxUnits }).map((_, idx) => {
                              const apt = apts[idx];
                              if (!apt) {
                                return <div key={idx} className="w-6 sm:w-7 h-6 sm:h-7" />;
                              }
                              const dim = !matchesFilter(apt, filter);
                              const fav = isFavorite(apt.id);
                              return (
                                <Tooltip key={apt.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      data-cell="1"
                                      onClick={() => onApartmentClick(apt)}
                                      className={cn(
                                        'relative w-6 sm:w-7 h-6 sm:h-7 rounded text-[9px] sm:text-[10px] font-bold grid place-items-center transition-all outline-none',
                                        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-warm-bg',
                                        STATUS_CELL[apt.status],
                                        dim && 'opacity-25 saturate-50',
                                      )}
                                    >
                                      {apt.rooms}
                                      {fav && (
                                        <Heart className="absolute -top-1 -right-1 h-2.5 w-2.5 fill-destructive text-destructive" />
                                      )}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="text-xs p-2 max-w-[200px]"
                                  >
                                    <div className="font-bold mb-1">
                                      № {apt.number} · {apt.rooms} BR
                                    </div>
                                    <div className="text-muted-foreground space-y-0.5">
                                      <div>{apt.area} m² · floor {apt.floor}</div>
                                      <div className="capitalize">Status: {apt.status}</div>
                                      <div>
                                        $
                                        {apt.price.toLocaleString()}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </TooltipProvider>
  );
};

export default BuildingMatrix;
