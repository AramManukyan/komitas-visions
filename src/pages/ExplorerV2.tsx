import '../i18n';
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type WheelEvent as RWheelEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  List,
  Map as MapIcon,
  Plus,
  Minus,
  RotateCcw,
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
import apartmentPlan from '@/assets/apartment-plan.jpg';

type View = '3d' | '2d';

const fmtArea = (n: number) =>
  `${n.toString().replace('.', ',')} m²`;

/* ------------------------------------------------------------------ */
const PlanThumb = ({ apt }: { apt: ExplorerApartment }) => (
  <img
    src={apartmentPlan}
    alt={`Floor plan ${apt.number}`}
    loading="lazy"
    className="w-full h-full object-contain p-2"
  />
);

const ApartmentCard = ({
  apt,
  onClick,
  isFav,
  onToggleFav,
}: {
  apt: ExplorerApartment;
  onClick: () => void;
  isFav: boolean;
  onToggleFav: () => void;
}) => {
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
            onToggleFav();
          }}
          className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background"
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition',
              isFav ? 'fill-destructive text-destructive' : 'text-muted-foreground',
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
              apt.status === 'available' &&
                'bg-[hsl(var(--status-available))]/15 text-[hsl(var(--status-available))]',
              apt.status === 'reserved' &&
                'bg-[hsl(var(--status-reserved))]/20 text-[hsl(var(--status-reserved-fg))]',
              apt.status === 'sold' &&
                'bg-[hsl(var(--status-sold))]/40 text-[hsl(var(--status-sold-fg))]',
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

  const MIN = 1;
  const MAX = 6;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinchStart = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(null);
  const movedRef = useRef(false);

  const toSvg = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    // svg uses xMidYMid slice — compute the actual rendered scale
    const renderScale = Math.max(rect.width / VBW, rect.height / VBH);
    const offsetX = (rect.width - VBW * renderScale) / 2;
    const offsetY = (rect.height - VBH * renderScale) / 2;
    return {
      x: (clientX - rect.left - offsetX) / renderScale,
      y: (clientY - rect.top - offsetY) / renderScale,
    };
  };

  const zoomAt = (clientX: number, clientY: number, nextScale: number) => {
    const s = Math.min(MAX, Math.max(MIN, nextScale));
    const p = toSvg(clientX, clientY);
    const k = s / t.scale;
    setT({ scale: s, x: p.x - (p.x - t.x) * k, y: p.y - (p.y - t.y) * k });
  };

  const onWheel = (e: RWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, t.scale * (1 + -e.deltaY * 0.0015));
  };

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;
    if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: t.scale,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
      panStart.current = null;
    }
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const next = pinchStart.current.scale * (d / pinchStart.current.dist);
      zoomAt(pinchStart.current.cx, pinchStart.current.cy, next);
      movedRef.current = true;
    } else if (pointers.current.size === 1 && panStart.current) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const renderScale = Math.max(rect.width / VBW, rect.height / VBH);
      const dx = (e.clientX - panStart.current.x) / renderScale;
      const dy = (e.clientY - panStart.current.y) / renderScale;
      if (Math.abs(e.clientX - panStart.current.x) + Math.abs(e.clientY - panStart.current.y) > 4) {
        movedRef.current = true;
      }
      const { tx, ty } = panStart.current;
      setT((cur) => ({ scale: cur.scale, x: tx + dx, y: ty + dy }));
    }
  };

  const endPointer = (e: RPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
  };

  const step = (factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, t.scale * factor);
  };

  const handleZoneClick = (b: BuildingInfo) => {
    if (movedRef.current) return;
    onSelect(b);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full touch-none select-none cursor-grab active:cursor-grabbing"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
    >
      <svg
        ref={svgRef}
        viewBox={geometry?.viewBox ?? '0 0 1600 900'}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <g transform={`translate(${t.x} ${t.y}) scale(${t.scale})`}>
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
                onClick={() => handleZoneClick(b)}
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
            const inv = 1 / t.scale;
            return (
              <g
                key={`marker-${z.id}`}
                transform={`translate(${z.bbox.cx}, ${z.bbox.cy}) scale(${inv})`}
                onClick={() => handleZoneClick(b)}
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
                <g transform={`translate(0, ${active ? 50 : 44})`}>
                  <rect
                    x={-32}
                    y={-12}
                    width={64}
                    height={22}
                    rx={11}
                    fill="hsl(0 0% 10% / 0.85)"
                    stroke="hsl(0 0% 100% / 0.15)"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={13}
                    fontWeight={700}
                    fill="hsl(0 0% 100%)"
                  >
                    {b.id}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-xl bg-background/85 backdrop-blur border border-border shadow-soft p-1 z-10">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => step(1.4)}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-primary"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => step(1 / 1.4)}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-primary"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => setT({ scale: 1, x: 0, y: 0 })}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
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
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-accent bg-accent/10"
            >
              Explorer
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
  const { t } = useTranslation();
  const { selection, update } = useExplorerUrlState();
  const { isFavorite, toggle: toggleFav, count: favCount } = useFavorites();

  const [unitType, setUnitType] = useState<string>('all');
  const [areaBucket, setAreaBucket] = useState<string>('all');
  const [floorBucket, setFloorBucket] = useState<string>('all');
  const [view, setView] = useState<View>('3d');
  const [detailsApt, setDetailsApt] = useState<ExplorerApartment | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [mobilePane, setMobilePane] = useState<'map' | 'list'>('map');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [asideWidth, setAsideWidth] = useState<number>(460);
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const min = 320;
      const max = Math.min(window.innerWidth - 360, 900);
      setAsideWidth(Math.max(min, Math.min(max, e.clientX)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  const selectedBuildingId = selection.buildingId;
  const setSelectedBuildingId = (id: string | null) => update({ buildingId: id });

  const activeFilterCount =
    (unitType !== 'all' ? 1 : 0) +
    (areaBucket !== 'all' ? 1 : 0) +
    (floorBucket !== 'all' ? 1 : 0) +
    (selectedBuildingId ? 1 : 0) +
    (showFavOnly ? 1 : 0);

  const resetFilters = () => {
    setUnitType('all');
    setAreaBucket('all');
    setFloorBucket('all');
    setSelectedBuildingId(null);
    setShowFavOnly(false);
  };

  const matrixFilter = useMemo(
    () => ({ unitType, areaBucket, floorBucket }),
    [unitType, areaBucket, floorBucket],
  );

  // Skeleton hint when filters change
  useEffect(() => {
    setListLoading(true);
    const t = setTimeout(() => setListLoading(false), 220);
    return () => clearTimeout(t);
  }, [unitType, areaBucket, floorBucket, selectedBuildingId, showFavOnly]);

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
      if (showFavOnly && !isFavorite(a.id)) return false;
      return a.status === 'available';
    });
  }, [unitType, areaBucket, floorBucket, selectedBuildingId, showFavOnly, isFavorite]);

  return (
    <div className="h-[100dvh] bg-warm-bg flex flex-col overflow-hidden">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Mobile / tablet pane toggle */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
        <button
          onClick={() => setMenuOpen(true)}
          className="h-10 w-10 shrink-0 grid place-items-center rounded-xl border border-border hover:bg-muted transition"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4 text-primary" />
        </button>
        <button
          onClick={() => setMobilePane('map')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition',
            mobilePane === 'map'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <MapIcon className="h-3.5 w-3.5" /> Map
        </button>
        <button
          onClick={() => setMobilePane('list')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition',
            mobilePane === 'list'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <List className="h-3.5 w-3.5" /> Apartments
          <span className="text-[10px] opacity-70">· {filtered.length}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <aside
          style={isDesktop ? { width: asideWidth, flex: '0 0 auto' } : undefined}
          className={cn(
            'w-full lg:w-[420px] xl:w-[500px] bg-background border-r border-border flex-col min-h-0 lg:h-full max-h-full',
            'lg:flex',
            mobilePane === 'list' ? 'flex flex-1' : 'hidden',
          )}
        >
          {/* Logo strip with menu trigger */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="hidden lg:grid h-10 w-10 place-items-center rounded-xl border border-border hover:bg-muted transition"
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
                    Explorer
                  </p>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setShowFavOnly((v) => !v)}
              aria-pressed={showFavOnly}
              className={cn(
                'relative h-9 w-9 grid place-items-center rounded-full border transition',
                showFavOnly
                  ? 'bg-destructive/10 border-destructive text-destructive'
                  : 'border-border hover:bg-muted text-muted-foreground',
              )}
              aria-label={t('explorer.showFavoritesOnly')}
            >
              <Heart className={cn('h-4 w-4', showFavOnly && 'fill-destructive')} />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold grid place-items-center">
                  {favCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters toggle */}
          <div className="px-5 pt-4 pb-2 border-b border-border flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-accent-foreground transition"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {filtersOpen ? t('explorer.filters.hide') : t('explorer.filters.show')}
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 h-4 min-w-4 grid place-items-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-destructive transition font-semibold"
              >
                {t('apartments.filters.reset')}
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                key="filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden border-b border-border"
              >
                <div className="px-5 py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                      <Select value={unitType} onValueChange={setUnitType}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder={t('explorer.filters.unitType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('explorer.filters.unitType')}</SelectItem>
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
                        <SelectValue placeholder={t('apartments.filters.floor')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('apartments.filters.floor')}</SelectItem>
                        <SelectItem value="1-4">1 – 4</SelectItem>
                        <SelectItem value="5-9">5 – 9</SelectItem>
                        <SelectItem value="10-16">10 – 16</SelectItem>
                      </SelectContent>
                    </Select>
                    <button className="h-11 rounded-xl border border-border bg-muted/40 hover:bg-muted transition flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                      <SlidersHorizontal className="h-4 w-4" />
                      {t('explorer.filters.more', { count: 0 })}
                    </button>
                  </div>

                  {selectedBuildingId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {t('explorer.filteredBy')}{' '}
                        <span className="font-semibold text-primary">{selectedBuildingId}</span>
                      </span>
                      <button
                        onClick={() => setSelectedBuildingId(null)}
                        className="text-accent-foreground/80 hover:text-accent-foreground underline"
                      >
                        {t('explorer.clear')}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">
              {filtered.length} apartments
              {showFavOnly && <span className="ml-2 text-destructive">· {t('explorer.favorites')}</span>}
            </p>
            {listLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 w-1/2 bg-muted rounded" />
                      <div className="h-2 w-2/3 bg-muted rounded" />
                      <div className="h-2 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-14 w-14 mx-auto rounded-full bg-muted grid place-items-center mb-3">
                  <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-heading text-base text-primary">{t('explorer.empty.title')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('explorer.empty.subtitleList')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.slice(0, 60).map((apt) => (
                  <ApartmentCard
                    key={apt.id}
                    apt={apt}
                    onClick={() => setDetailsApt(apt)}
                    isFav={isFavorite(apt.id)}
                    onToggleFav={() => toggleFav(apt.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Splitter (desktop only) */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDoubleClick={() => setAsideWidth(460)}
          className={cn(
            'hidden lg:flex group relative w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-border hover:bg-accent transition-colors',
            dragging && 'bg-accent',
          )}
          aria-label={t('explorer.resizePanels')}
        >
          <div className="absolute top-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-foreground/20 group-hover:bg-accent-foreground/60 transition" />
        </div>

        {/* Right panel */}
        <main className={cn(
          'flex-1 relative min-h-0 lg:h-full overflow-hidden bg-primary',
          'lg:block',
          mobilePane === 'map' ? 'flex flex-1' : 'hidden',
        )}>
          {/* Top overlay row — stacks on mobile to avoid overlap */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-row items-center justify-between gap-2 sm:gap-3 pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-foreground/85 backdrop-blur border border-white/10 text-background text-xs sm:text-sm font-semibold shadow-elevated pointer-events-auto min-w-0">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">
                {view === '3d'
                  ? selectedBuildingId
                    ? `Building ${selectedBuildingId} selected`
                    : 'Pick a block'
                  : 'Browse buildings'}
              </span>
            </div>
            <div className="pointer-events-auto shrink-0">
              <ViewSwitcher view={view} onChange={setView} />
            </div>
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
                  onSelect={(b) => {
                    setSelectedBuildingId(b.id);
                    // Auto-switch to 2D so the user sees the building layout
                    setView('2d');
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="2d"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 overflow-y-auto bg-warm-bg pt-24 sm:pt-20"
              >
                <div className="p-3 sm:p-6 lg:p-10">
                  <div className="mb-6 max-w-2xl">
                    <span className="text-[11px] uppercase tracking-[0.3em] text-accent-foreground/60 font-semibold">
                      Building layout
                    </span>
                    <h2 className="font-heading text-2xl md:text-4xl text-primary font-semibold mt-1">
                      {selectedBuildingId ? `Building ${selectedBuildingId}` : 'All buildings'}
                    </h2>
                    <p className="text-muted-foreground mt-2 font-body text-sm">
                      Click any apartment to view details. Use arrow keys to navigate the grid.
                    </p>
                  </div>
                  <BuildingMatrix
                    selectedBuildingId={selectedBuildingId}
                    filter={matrixFilter}
                    isFavorite={isFavorite}
                    onApartmentClick={(apt) => setDetailsApt(apt)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
