import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Inbox, Layers, X, ParkingSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { BUILDINGS, EXPLORER_APARTMENTS, type ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';
import apartmentPlan from '@/assets/apartment-plan.jpg';

export interface MatrixFilter {
  unitType: string;
  areaBucket: string;
  floorBucket: string;
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
  { key: 'available' as const, cls: 'bg-[hsl(var(--status-available))]' },
  { key: 'reserved' as const, cls: 'bg-[hsl(var(--status-reserved))]' },
  { key: 'sold' as const, cls: 'bg-[hsl(var(--status-sold))]' },
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
  const { t } = useTranslation();
  const visibleBuildings = useMemo(
    () => (selectedBuildingId ? BUILDINGS.filter((b) => b.id === selectedBuildingId) : BUILDINGS),
    [selectedBuildingId],
  );

  // Per-building active entrance ("all" or entrance id)
  const [activeEntrance, setActiveEntrance] = useState<Record<string, string>>({});
  const getActiveEntrance = (id: string) => activeEntrance[id] ?? 'all';
  const setEntrance = (id: string, e: string) =>
    setActiveEntrance((prev) => ({ ...prev, [id]: e }));

  // Floor plan dialog state
  const [floorView, setFloorView] = useState<{ buildingId: string; floor: number } | null>(null);

  const maxFloors = useMemo(
    () => Math.max(...visibleBuildings.map((b) => b.floors)),
    [visibleBuildings],
  );
  const floorRows = Array.from({ length: maxFloors }, (_, i) => maxFloors - i);

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

  const floorApartments = useMemo(() => {
    if (!floorView) return [];
    return EXPLORER_APARTMENTS.filter(
      (a) =>
        `${a.block}-${a.building}` === floorView.buildingId && a.floor === floorView.floor,
    ).sort((a, b) => a.number.localeCompare(b.number));
  }, [floorView]);

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {LEGEND.map((l) => (
            <div
              key={l.key}
              className="flex items-center gap-2 text-xs font-medium text-foreground/80"
            >
              <span className={cn('h-3.5 w-3.5 rounded-sm', l.cls)} />
              {t(`apartments.status.${l.key}`)}
              <span className="text-muted-foreground tabular-nums">· {counts[l.key]}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{totalMatching}</span>{' '}
          {t('explorer.matchingUnits')}
        </div>
      </div>

      {totalMatching === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 grid place-items-center text-center">
          <div className="h-16 w-16 rounded-full bg-muted grid place-items-center mb-3">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-heading text-lg text-primary">{t('explorer.empty.title')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('explorer.empty.subtitle')}
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          onKeyDown={handleKeyNav}
          className="flex gap-8 md:gap-12 items-start overflow-x-auto pb-4"
        >
          {/* Floor numbers column */}
          <div className="flex flex-col gap-1 pt-[88px] shrink-0 sticky left-0 bg-warm-bg z-10">
            {floorRows.map((f) => (
              <div
                key={f}
                className="h-6 sm:h-7 w-6 sm:w-8 grid place-items-center text-[10px] sm:text-[11px] font-semibold text-muted-foreground bg-muted/50 rounded"
              >
                {f}
              </div>
            ))}
            {[-1, -2].map((p) => (
              <div
                key={p}
                className="h-7 sm:h-8 w-6 sm:w-8 mt-1 grid place-items-center text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 rounded"
              >
                {p}
              </div>
            ))}
          </div>

          {visibleBuildings.map((building) => {
            const ae = getActiveEntrance(building.id);
            const visibleEntrances =
              ae === 'all'
                ? building.entrances
                : building.entrances.filter((e) => e.id === ae);

            return (
              <div key={building.id} className="shrink-0">
                {/* Header with progress */}
                <div className="mb-2 text-center">
                  <div className="text-sm font-bold text-foreground">
                    {building.block} / {building.number}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {building.status === 'ready'
                      ? t('explorer.building.ready')
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

                {/* Entrance switcher */}
                {building.entrances.length > 1 && (
                  <div className="mb-2 flex items-center justify-center gap-1 p-0.5 rounded-full bg-muted/60 border border-border">
                    <button
                      onClick={() => setEntrance(building.id, 'all')}
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition',
                        ae === 'all'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      All
                    </button>
                    {building.entrances.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setEntrance(building.id, e.id)}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition',
                          ae === e.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                        title={`Entrance ${e.id}`}
                      >
                        {e.id}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {visibleEntrances.map((entrance) => {
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
                          const hasApts = apts.length > 0;
                          return (
                            <div key={floor} className="flex items-center gap-0.5 h-6 sm:h-7">
                              {hasApts && (
                                <button
                                  onClick={() => setFloorView({ buildingId: building.id, floor })}
                                  className="h-6 sm:h-7 w-5 grid place-items-center rounded text-[9px] text-muted-foreground hover:text-accent-foreground hover:bg-accent/20 transition shrink-0"
                                  title={`View floor ${floor} plan`}
                                  aria-label={`View floor ${floor} plan`}
                                >
                                  <Layers className="h-3 w-3" />
                                </button>
                              )}
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
                                        <div className="capitalize">
                                          {t('explorer.labels.status')}: {t(`apartments.status.${apt.status}`)}
                                        </div>
                                        <div>${apt.price.toLocaleString()}</div>
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
            );
          })}
        </div>
      )}

      {/* Floor plan dialog */}
      <Dialog open={!!floorView} onOpenChange={(o) => !o && setFloorView(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl">
          <DialogTitle className="sr-only">
            Floor {floorView?.floor} plan — Building {floorView?.buildingId}
          </DialogTitle>
          <div className="relative px-6 pt-5 pb-3 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                {floorView ? `Building ${floorView.buildingId}` : ''}
              </p>
              <h3 className="font-heading text-2xl font-bold text-primary leading-tight">
                Floor {floorView?.floor} plan
              </h3>
            </div>
            <button
              onClick={() => setFloorView(null)}
              className="h-9 w-9 rounded-full bg-background border border-border grid place-items-center text-primary hover:text-accent transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative w-full aspect-[16/9] bg-muted rounded-2xl overflow-hidden border border-border">
              <img
                src={apartmentPlan}
                alt={`Floor ${floorView?.floor} plan`}
                className="absolute inset-0 w-full h-full object-contain p-4"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Apartments on this floor · {floorApartments.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {floorApartments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => {
                      onApartmentClick(apt);
                      setFloorView(null);
                    }}
                    className={cn(
                      'px-3 py-2 rounded-xl border text-xs font-semibold transition hover:-translate-y-0.5',
                      STATUS_CELL[apt.status],
                    )}
                  >
                    №{apt.number} · {apt.rooms} BR · {apt.area} m²
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default BuildingMatrix;
