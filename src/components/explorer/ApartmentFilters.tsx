import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EXPLORER_APARTMENTS } from '@/data/explorer';

export type StatusFilter = 'all' | 'available' | 'reserved' | 'sold';

export interface FilterState {
  rooms: string; // 'all' | '1'..'4'
  status: StatusFilter;
  area: [number, number];
  price: [number, number];
  promoOnly: boolean;
}

const ALL = 'all';

const ROOMS = Array.from(
  new Set(EXPLORER_APARTMENTS.map((a) => a.rooms)),
).sort();

const AREA_MIN = Math.min(...EXPLORER_APARTMENTS.map((a) => a.area));
const AREA_MAX = Math.max(...EXPLORER_APARTMENTS.map((a) => a.area));
const PRICE_MIN = Math.min(...EXPLORER_APARTMENTS.map((a) => a.price));
const PRICE_MAX = Math.max(...EXPLORER_APARTMENTS.map((a) => a.price));

export const defaultFilters: FilterState = {
  rooms: ALL,
  status: 'all',
  area: [AREA_MIN, AREA_MAX],
  price: [PRICE_MIN, PRICE_MAX],
  promoOnly: false,
};

export const FILTER_BOUNDS = {
  area: [AREA_MIN, AREA_MAX] as [number, number],
  price: [PRICE_MIN, PRICE_MAX] as [number, number],
};

const fmtPrice = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}K`;

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

const ApartmentFilters = ({ value, onChange, onReset, resultCount }: Props) => {
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...value, [k]: v });

  const activeBadges = useMemo(() => {
    const chips: string[] = [];
    if (value.rooms !== ALL) chips.push(`${value.rooms} rooms`);
    if (value.status !== 'all') chips.push(value.status);
    if (value.area[0] !== AREA_MIN || value.area[1] !== AREA_MAX)
      chips.push(`${value.area[0]}–${value.area[1]} m²`);
    if (value.price[0] !== PRICE_MIN || value.price[1] !== PRICE_MAX)
      chips.push(`${fmtPrice(value.price[0])}–${fmtPrice(value.price[1])} AMD`);
    if (value.promoOnly) chips.push('Promo only');
    return chips;
  }, [value]);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-soft p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Rooms */}
        <div className="flex flex-col gap-1.5">
          <Label>Rooms</Label>
          <Select value={value.rooms} onValueChange={(v) => set('rooms', v)}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value={ALL}>Any</SelectItem>
              {ROOMS.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <div className="flex gap-1 p-1 bg-muted rounded-xl h-11">
            {(['all', 'available', 'reserved', 'sold'] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 text-[11px] uppercase tracking-wider font-semibold rounded-lg transition-all ${
                    value.status === s
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {s}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Area */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <Label>Area</Label>
            <span className="text-xs text-muted-foreground">
              {value.area[0]}–{value.area[1]} m²
            </span>
          </div>
          <Slider
            min={AREA_MIN}
            max={AREA_MAX}
            step={1}
            value={value.area}
            onValueChange={(v) => set('area', [v[0], v[1]] as [number, number])}
            className="mt-2"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <Label>Price (AMD)</Label>
            <span className="text-xs text-muted-foreground">
              {fmtPrice(value.price[0])}–{fmtPrice(value.price[1])}
            </span>
          </div>
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100_000}
            value={value.price}
            onValueChange={(v) =>
              set('price', [v[0], v[1]] as [number, number])
            }
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => set('promoOnly', !value.promoOnly)}
            className={`text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full border transition ${
              value.promoOnly
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary'
            }`}
          >
            ★ Promo only
          </button>
          {activeBadges.map((b) => (
            <Badge key={b} variant="outline" className="rounded-full">
              {b}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {resultCount} apartments
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-9 rounded-xl gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
    {children}
  </span>
);

export default ApartmentFilters;
