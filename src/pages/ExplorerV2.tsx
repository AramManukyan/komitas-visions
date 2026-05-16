import '../i18n';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Ruler,
  Hash,
  SlidersHorizontal,
  MapPin,
  LayoutGrid,
  Box,
  Menu,
  X,
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useExplorerUrlState } from '@/hooks/useExplorerUrlState';
import ApartmentDetailsSheet from '@/components/explorer/ApartmentDetailsSheet';
import BuildingMatrix from '@/components/explorer/BuildingMatrix';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
import logo from '@/assets/logo.png';

type View = '3d' | '2d';

const fmtArea = (n: number) =>
  `${n.toString().replace('.', ',')} m²`;

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

const ApartmentCard = ({
  apt,
  onClick,
}: {
  apt: ExplorerApartment;
  onClick: () => void;
}) => {
  const [fav, setFav] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className="group relative w-full text-left bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated transition-shadow cursor-pointer"
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
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Premium View Switcher                                               */
/* ------------------------------------------------------------------ */
const ViewSwitcher = ({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) => (
  <div className="relative inline-flex items-center p-1 rounded-full bg-foreground/85 backdrop-blur-md border border-white/15 shadow-elevated">
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-br from-accent to-accent/80 shadow-md"
      style={{ left: view === '3d' ? 4 : 'calc(50% + 0px)' }}
    />
    {(['3d', '2d'] as const).map((v) => {
      const Icon = v === '3d' ? Box : LayoutGrid;
      const active = view === v;
      return (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'relative z-10 flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
            active ? 'text-accent-foreground' : 'text-background/70 hover:text-background',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {v.toUpperCase()}
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* 3D Masterplan with numbered markers                                 */
/* ------------------------------------------------------------------ */
const MarkerMap = ({
  buildings,
  selectedId,
  onSelect,
}: {
  buildings: BuildingInfo[];
  selectedId: string | null;
  onSelect: (b: BuildingInfo) => void;
}) => {
  const geometry = getMasterplanGeometry('komitas');
  const vb = (geometry?.viewBox ?? '0 0 1600 900').split(' ').map(Number);
  const VBW = vb[2];
  const VBH = vb[3];

  return (
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
      />

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
            style={{ transition: 'fill .25s, stroke .25s' }}
            onMouseEnter={(e) => {
              if (!active) (e.currentTarget as SVGPolygonElement).setAttribute('fill', 'hsl(214 80% 55% / 0.25)');
            }}
            onMouseLeave={(e) => {
              if (!active) (e.currentTarget as SVGPolygonElement).setAttribute('fill', 'hsl(214 80% 55% / 0)');
            }}
          />
        );
      })}

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
  );
};

/* ------------------------------------------------------------------ */
/* Sliding Sidebar Menu                                                */
/* ------------------------------------------------------------------ */
const navKeys = ['about', 'gallery', 'amenities', 'location', 'banks', 'contact'] as const;

const SideMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        />
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="fixed top-0 left-0 bottom-0 z-[70] w-[320px] bg-primary text-primary-foreground flex flex-col shadow-elevated"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-10 w-auto" />
              <span className="font-heading text-accent text-sm font-bold tracking-widest uppercase">
                New Komitas
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navKeys.map((key, i) => (
              <motion.a
                key={key}
                href={`/#${key}`}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  window.location.href = `/#${key}`;
                }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 hover:text-accent hover:bg-white/5 transition"
              >
                {key}
              </motion.a>
            ))}
            <div className="h-px bg-white/10 my-3" />
            <Link
              to="/apartments"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 hover:text-accent hover:bg-white/5 transition"
            >
              Apartments
            </Link>
            <Link
              to="/explorer"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-accent hover:bg-white/5 transition"
            >
              Explorer
            </Link>
            <Link
              to="/explorer/v2"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-accent bg-accent/10"
            >
              Explorer v2
            </Link>
          </nav>

          <div className="px-6 py-4 border-t border-white/10">
            <LanguageSwitcher />
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

/* ------------------------------------------------------------------ */
const ExplorerV2 = () => {
  const [unitType, setUnitType] = useState<string>('all');
  const [areaBucket, setAreaBucket] = useState<string>('all');
  const [floorBucket, setFloorBucket] = useState<string>('all');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [view, setView] = useState<View>('3d');
  const [detailsApt, setDetailsApt] = useState<ExplorerApartment | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="h-screen bg-warm-bg flex flex-col overflow-hidden">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <aside className="w-full lg:w-[460px] xl:w-[500px] bg-background border-r border-border flex flex-col min-h-0 lg:h-full max-h-full">
          {/* Logo strip with menu trigger */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="h-10 w-10 grid place-items-center rounded-xl border border-border hover:bg-muted transition"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4 text-primary" />
              </button>
              <Link to="/" className="flex items-center gap-2.5">
                <img src={logo} alt="New Komitas" className="h-9 w-auto" />
                <div className="leading-tight">
                  <p className="font-heading text-base font-bold tracking-tight text-primary">
                    KOMITAS<span className="text-accent">™</span>
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-body">
                    Explorer v2
                  </p>
                </div>
              </Link>
            </div>
            <button className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-muted transition">
              <Heart className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Filters */}
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

        {/* Right panel */}
        <main className="flex-1 relative min-h-[70vh] lg:min-h-0 lg:h-full overflow-hidden bg-primary">
          {/* Pick-a-block label */}
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/85 backdrop-blur border border-white/10 text-background text-sm font-semibold shadow-elevated">
              <MapPin className="h-4 w-4" />
              {view === '3d' ? 'Pick a block' : 'Browse buildings'}
            </div>
          </div>

          {/* View Switcher */}
          <div className="absolute top-4 right-4 z-20">
            <ViewSwitcher view={view} onChange={setView} />
          </div>

          {/* Content swap */}
          <AnimatePresence mode="wait">
            {view === '3d' ? (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <MarkerMap
                  buildings={BUILDINGS}
                  selectedId={selectedBuildingId}
                  onSelect={(b) => setSelectedBuildingId(b.id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="2d"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 overflow-y-auto bg-warm-bg"
              >
                <div className="p-6 lg:p-10">
                  <div className="mb-6 max-w-2xl">
                    <span className="text-[11px] uppercase tracking-[0.3em] text-accent-foreground/60 font-semibold">
                      Building layout
                    </span>
                    <h2 className="font-heading text-2xl md:text-4xl text-primary font-semibold mt-1">
                      {selectedBuildingId ? `Building ${selectedBuildingId}` : 'All buildings'}
                    </h2>
                    <p className="text-muted-foreground mt-2 font-body text-sm">
                      Click any apartment to view details. Numbers indicate bedrooms.
                    </p>
                  </div>
                  <BuildingMatrix
                    selectedBuildingId={selectedBuildingId}
                    onApartmentClick={(apt) => setDetailsApt(apt)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            to="/explorer"
            className="absolute bottom-5 right-5 z-20 px-3 py-2 rounded-full bg-background/90 backdrop-blur border border-border text-xs font-semibold text-primary hover:bg-background transition shadow-soft"
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
