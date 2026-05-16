import { useMemo } from 'react';
import { BUILDINGS, EXPLORER_APARTMENTS, type ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';

interface Props {
  selectedBuildingId: string | null;
  onApartmentClick: (apt: ExplorerApartment) => void;
}

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-700 text-white hover:bg-emerald-600',
  reserved: 'bg-amber-400 text-amber-950 hover:bg-amber-300',
  sold: 'bg-muted text-muted-foreground/60 hover:bg-muted/80',
};

const LEGEND = [
  { key: 'available', label: 'available', cls: 'bg-emerald-700' },
  { key: 'reserved', label: 'reserved', cls: 'bg-amber-400' },
  { key: 'sold', label: 'sold', cls: 'bg-muted-foreground/40' },
];

const BuildingMatrix = ({ selectedBuildingId, onApartmentClick }: Props) => {
  const visibleBuildings = useMemo(
    () => (selectedBuildingId ? BUILDINGS.filter((b) => b.id === selectedBuildingId) : BUILDINGS),
    [selectedBuildingId],
  );

  const maxFloors = useMemo(
    () => Math.max(...visibleBuildings.map((b) => b.floors)),
    [visibleBuildings],
  );
  const floorRows = Array.from({ length: maxFloors }, (_, i) => maxFloors - i);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {LEGEND.map((l) => (
          <div key={l.key} className="flex items-center gap-2 text-xs font-medium text-foreground/80">
            <span className={cn('h-3.5 w-3.5 rounded-sm', l.cls)} />
            {l.label}
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-start overflow-x-auto pb-4">
        {/* Floor numbers column */}
        <div className="flex flex-col gap-1 pt-10 shrink-0">
          {floorRows.map((f) => (
            <div
              key={f}
              className="h-7 w-8 grid place-items-center text-[11px] font-semibold text-muted-foreground bg-muted/40 rounded"
            >
              {f}
            </div>
          ))}
        </div>

        {visibleBuildings.map((building) => (
          <div key={building.id} className="shrink-0">
            <div className="text-center text-sm font-bold text-foreground mb-2">
              {building.block} / {building.number}
            </div>
            <div className="flex gap-2">
              {building.entrances.map((entrance) => {
                // Compute max units per floor for this entrance
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
                        <div key={floor} className="flex gap-0.5 h-7">
                          {Array.from({ length: maxUnits }).map((_, idx) => {
                            const apt = apts[idx];
                            if (!apt) {
                              return <div key={idx} className="w-7 h-7" />;
                            }
                            return (
                              <button
                                key={apt.id}
                                onClick={() => onApartmentClick(apt)}
                                title={`${apt.number} · ${apt.rooms} BR · ${apt.area} m²`}
                                className={cn(
                                  'w-7 h-7 rounded text-[10px] font-bold grid place-items-center transition-colors',
                                  STATUS_STYLES[apt.status],
                                )}
                              >
                                {apt.rooms}
                              </button>
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
    </div>
  );
};

export default BuildingMatrix;
