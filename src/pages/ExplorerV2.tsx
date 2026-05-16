import '../i18n';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Ruler,
  Hash,
  SlidersHorizontal,
  MapPin,
  LayoutGrid,
  Box,
} from 'lucide-react';
import Header from '@/components/Header';
import ApartmentDetailsSheet from '@/components/explorer/ApartmentDetailsSheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BUILDINGS,
  EXPLORER_APARTMENTS,
  type ExplorerApartment,
  type BuildingInfo,
} from '@/data/explorer';
import { getMasterplanGeometry } from '@/data/geometry';
import { cn } from '@/lib/utils';
import masterplanImg from '@/assets/explorer-masterplan.jpg';

type View = '3d' | '2d';

const fmtArea = (n: number) =>
  `${n.toString().replace('.', ',')} m²`;

/* ------------------------------------------------------------------ */
/* Mini floor plan thumb (procedural, mimics the reference)            */
/* ------------------------------------------------------------------ */
const PlanThumb = ({ apt }: { apt: ExplorerApartment }) => {
  const seed = parseInt(apt.number.slice(-2), 10) || 1;
  const variant = seed % 3;
  return (
    <svg viewBox="0 0 160 130" className="w-full h-full">
      <rect x="6" y="6" width="148" height="118" rx="4" fill="hsl(40 30% 96%)" stroke="hsl(214 20% 70%)" strokeWidth="1.5" />
      <rect x="14" y="14" width="60" height="50" fill="none" stroke="hsl(214 25% 55%)" strokeWidth="1.2" />
      <text x="44" y="42" textAnchor="middle" fontSize="8" fill="hsl(214 25% 40%)">{(12 + variant).toFixed(1)} m²</text>
      <rect x="78" y="14" width="68" height="78" fill="none" stroke="hsl(214 25% 55%)" strokeWidth="1.2" />
      <text x="112" y="56" textAnchor="middle" fontSize="8" fill="hsl(214 25% 40%)">{(18 + variant * 2).toFixed(1)} m²</text>
      <rect x="14" y="68" width="28" height="24" fill="none" stroke="hsl(214 25% 55%)" strokeWidth="1.2" />
      <text x="28" y="83" textAnchor="middle" fontSize="6" fill="hsl(214 25% 40%)">3.9</text>
      <rect x="46" y="68" width="28" height="24" fill="none" stroke="hsl(214 25% 55%)" strokeWidth="1.2" />
      <text x="60" y="83" textAnchor="middle" fontSize="6" fill="hsl(214 25% 40%)">5.3</text>
      <rect x="14" y="96" width="132" height="22" fill="none" stroke="hsl(214 25% 55%)" strokeWidth="1.2" />
      <text x="80" y="111" textAnchor="middle" fontSize="6" fill="hsl(214 25% 40%)">6.4 m²</text>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
const ApartmentCard = ({
  apt,
  onClick,
}: {
  apt: ExplorerApartment;
  onClick: () => void;
}) => {
  const [fav, setFav] = useState(false);
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative w-full text-left bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-muted">
        <PlanThumb apt={apt} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFav((v) => !v);
          }}
          className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background"
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition',
              fav ? 'fill-destructive text-destructive' : 'text-muted-foreground',
            )}
          />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            {apt.rooms} BR
          </span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
              apt.status === 'available' && 'bg-emerald-500/15 text-emerald-700',
              apt.status === 'reserved' && 'bg-amber-500/15 text-amber-700',
              apt.status === 'sold' && 'bg-rose-500/15 text-rose-700',
            )}
          >
            {apt.status}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2 font-body">
          block {apt.block.toLowerCase()} <span className="opacity-40">|</span>{' '}
          house {apt.building} <span className="opacity-40">|</span> floor {apt.floor}
        </p>
        <div className="flex items-center justify-between text-[11px] text-foreground/80 border-t border-border pt-2">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" /> {apt.number}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="h-3 w-3" /> {fmtArea(apt.area)}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

/* ------------------------------------------------------------------ */
/* Masterplan with numbered markers (right panel)                      */
/* ------------------------------------------------------------------ */
const MarkerMap = ({
  buildings,
  selectedId,
  onSelect,
  view,
  onViewChange,
}: {
  buildings: BuildingInfo[];
  selectedId: string | null;
  onSelect: (b: BuildingInfo) => void;
  view: View;
  onViewChange: (v: View) => void;
}) => {
  const geometry = getMasterplanGeometry('komitas');
  const vb = (geometry?.viewBox ?? '0 0 1600 900').split(' ').map(Number);
  const VBW = vb[2];
  const VBH = vb[3];

  return (
    <div className="relative w-full h-full overflow-hidden bg-primary">
      <svg
        viewBox={geometry?.viewBox ?? '0 0 1600 900'}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
      >
        <image
          href={masterplanImg}
          x={0}
          y={0}
          width={VBW}
          height={VBH}
          preserveAspectRatio="xMidYMid slice"
          className={cn(
            'transition-all duration-700',
            view === '2d' ? '[filter:grayscale(1)_brightness(1.1)_contrast(1.1)]' : '',
          )}
        />

        {/* Hover/click zones for all buildings */}
        {geometry?.zones.map((z) => {
          const active = selectedId === z.id;
          const b = buildings.find((bb) => bb.id === z.id);
          if (!b) return null;
          return (
            <polygon
              key={`zone-${z.id}`}
              points={z.points}
              onClick={() => onSelect(b)}
              className="cursor-pointer transition-all"
              fill={active ? 'hsl(214 80% 55% / 0.45)' : 'hsl(214 80% 55% / 0)'}
              stroke={active ? 'hsl(214 90% 70%)' : 'hsl(0 0% 100% / 0)'}
              strokeWidth={4}
              style={{
                transition: 'fill .25s, stroke .25s',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as SVGPolygonElement).setAttribute('fill', 'hsl(214 80% 55% / 0.25)');
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as SVGPolygonElement).setAttribute('fill', 'hsl(214 80% 55% / 0)');
              }}
            />
          );
        })}

        {/* Numbered markers */}
        {geometry?.zones.map((z, i) => {
          const b = buildings.find((bb) => bb.id === z.id);
          if (!b || !z.bbox) return null;
          const active = selectedId === b.id;
          return (
            <g
              key={`marker-${z.id}`}
              transform={`translate(${z.bbox.cx}, ${z.bbox.cy})`}
              onClick={() => onSelect(b)}
              className="cursor-pointer"
            >
              <circle
                r={active ? 28 : 24}
                fill={active ? 'hsl(45 80% 55%)' : 'hsl(0 0% 10% / 0.85)'}
                stroke={active ? 'hsl(45 80% 75%)' : 'hsl(0 0% 100% / 0.2)'}
                strokeWidth={active ? 6 : 2}
                style={{ transition: 'all .25s' }}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={700}
                fill={active ? 'hsl(214 60% 12%)' : 'hsl(0 0% 100%)'}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/85 backdrop-blur border border-white/10 text-background text-sm font-semibold shadow-elevated">
          <MapPin className="h-4 w-4" />
          Pick a block
        </div>
      </div>

      <div className="absolute top-4 right-4 flex rounded-xl overflow-hidden border border-white/20 bg-foreground/70 backdrop-blur shadow-elevated">
        <button
          onClick={() => onViewChange('3d')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition',
            view === '3d' ? 'bg-background text-foreground' : 'text-background hover:bg-white/10',
          )}
        >
          <Box className="h-3.5 w-3.5" />
          3D view
        </button>
        <button
          onClick={() => onViewChange('2d')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition',
            view === '2d' ? 'bg-background text-foreground' : 'text-background hover:bg-white/10',
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          2D view
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
const ExplorerV2 = () => {
  const [unitType, setUnitType] = useState<string>('all');
  const [areaBucket, setAreaBucket] = useState<string>('all');
  const [floorBucket, setFloorBucket] = useState<string>('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [view, setView] = useState<View>('3d');
  const [detailsApt, setDetailsApt] = useState<ExplorerApartment | null>(null);

  const filtered = useMemo(() => {
    return EXPLORER_APARTMENTS.filter((a) => {
      if (unitType !== 'all' && String(a.rooms) !== unitType) return false;
      if (areaBucket !== 'all') {
        const [min, max] = areaBucket.split('-').map(Number);
        if (a.area < min || a.area > max) return false;
      }
      if (floorBucket !== 'all') {
        const [min, max] = floorBucket.split('-').map(Number);
        if (a.floor < min || a.floor > max) return false;
      }
      if (selectedBuildingId && `${a.block}-${a.building}` !== selectedBuildingId) return false;
      return a.status === 'available';
    });
  }, [unitType, areaBucket, floorBucket, selectedBuildingId]);

  const currentIdx = selectedBuildingId
    ? BUILDINGS.findIndex((b) => b.id === selectedBuildingId)
    : -1;
  const cycle = (delta: number) => {
    const next = ((currentIdx === -1 ? 0 : currentIdx) + delta + BUILDINGS.length) % BUILDINGS.length;
    setSelectedBuildingId(BUILDINGS[next].id);
  };

  return (
    <div className="h-screen bg-warm-bg flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <aside className="w-full lg:w-[460px] xl:w-[500px] bg-background border-r border-border flex flex-col min-h-0 lg:h-full max-h-full">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <Link to="/" className="font-heading text-xl font-bold tracking-tight text-primary">
              KOMITAS<span className="text-accent">™</span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-body font-normal">
                Explorer v2
              </span>
            </Link>
            <button className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-muted transition">
              <Heart className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select value={unitType} onValueChange={setUnitType}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="unit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">unit type</SelectItem>
                  <SelectItem value="1">1 BR</SelectItem>
                  <SelectItem value="2">2 BR</SelectItem>
                  <SelectItem value="3">3 BR</SelectItem>
                  <SelectItem value="4">4 BR</SelectItem>
                </SelectContent>
              </Select>
              <Select value={areaBucket} onValueChange={setAreaBucket}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="total area, m²" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">total area, m²</SelectItem>
                  <SelectItem value="0-50">up to 50</SelectItem>
                  <SelectItem value="50-80">50 – 80</SelectItem>
                  <SelectItem value="80-120">80 – 120</SelectItem>
                  <SelectItem value="120-500">120+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={floorBucket} onValueChange={setFloorBucket}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">floor</SelectItem>
                  <SelectItem value="1-4">1 – 4</SelectItem>
                  <SelectItem value="5-9">5 – 9</SelectItem>
                  <SelectItem value="10-16">10 – 16</SelectItem>
                </SelectContent>
              </Select>
              <button className="h-11 rounded-xl border border-border bg-muted/40 hover:bg-muted transition flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                more filters (0)
              </button>
            </div>

            {selectedBuildingId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Filtered by <span className="font-semibold text-primary">{selectedBuildingId}</span>
                </span>
                <button
                  onClick={() => setSelectedBuildingId(null)}
                  className="text-accent-foreground/80 hover:text-accent-foreground underline"
                >
                  clear
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">
              {filtered.length} apartments
            </p>
            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-sm">
                No apartments match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.slice(0, 60).map((apt) => (
                  <ApartmentCard
                    key={apt.id}
                    apt={apt}
                    onClick={() => setDetailsApt(apt)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 relative min-h-[70vh] lg:min-h-0 lg:h-full overflow-hidden">
          <MarkerMap
            buildings={BUILDINGS}
            selectedId={selectedBuildingId}
            onSelect={(b) => setSelectedBuildingId(b.id)}
            view={view}
            onViewChange={setView}
          />

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => cycle(-1)}
              className="h-11 w-11 rounded-full shadow-elevated bg-background/95 backdrop-blur hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => cycle(1)}
              className="h-11 w-11 rounded-full shadow-elevated bg-background/95 backdrop-blur hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <Link
            to="/explorer"
            className="absolute bottom-5 right-5 px-3 py-2 rounded-full bg-background/90 backdrop-blur border border-border text-xs font-semibold text-primary hover:bg-background transition shadow-soft"
          >
            ← Explorer v1
          </Link>
        </main>
      </div>

      <ApartmentDetailsSheet
        apartment={detailsApt}
        onClose={() => setDetailsApt(null)}
        shareUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </div>
  );
};

export default ExplorerV2;
