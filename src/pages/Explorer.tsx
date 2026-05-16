import '../i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight, Building2, Layers, Home, CalendarCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import Masterplan from '@/components/explorer/Masterplan';
import BuildingsGrid from '@/components/explorer/BuildingsGrid';
import BuildingFacade from '@/components/explorer/BuildingFacade';
import FloorPlanViewer from '@/components/explorer/FloorPlanViewer';
import ApartmentFilters, {
  defaultFilters,
  type FilterState,
} from '@/components/explorer/ApartmentFilters';
import ApartmentGrid from '@/components/explorer/ApartmentGrid';
import ApartmentDetailsSheet from '@/components/explorer/ApartmentDetailsSheet';
import { Button } from '@/components/ui/button';
import {
  DISTRICTS,
  EXPLORER_APARTMENTS,
  findApartment,
  findBuilding,
  apartmentsIn,
  type ExplorerApartment,
} from '@/data/explorer';
import { useExplorerUrlState } from '@/hooks/useExplorerUrlState';
import heroBg from '@/assets/hero-bg.jpg';

const district = DISTRICTS[0];

const Explorer = () => {
  const { t } = useTranslation();
  const { selection, update, clearFrom } = useExplorerUrlState();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [detailsApt, setDetailsApt] = useState<ExplorerApartment | null>(null);

  const drilldownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const building = findBuilding(selection.buildingId);
  const entranceId =
    selection.entranceId ?? building?.entrances[0]?.id ?? null;

  // open details if URL deep-links to an apartment
  useEffect(() => {
    if (selection.apartmentId) {
      const apt = findApartment(selection.apartmentId);
      if (apt) setDetailsApt(apt);
    }
  }, [selection.apartmentId]);

  /* Apartment list driven by selection + filters */
  const filtered = useMemo(() => {
    const scope = apartmentsIn(
      selection.buildingId,
      selection.entranceId,
      selection.floor,
    );
    const list = (scope.length ? scope : EXPLORER_APARTMENTS).filter((a) => {
      if (filters.rooms !== 'all' && String(a.rooms) !== filters.rooms) return false;
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (a.area < filters.area[0] || a.area > filters.area[1]) return false;
      if (a.price < filters.price[0] || a.price > filters.price[1]) return false;
      if (filters.promoOnly && !a.tag) return false;
      return true;
    });
    return list;
  }, [selection, filters]);

  /* Hero stats */
  const stats = useMemo(() => {
    const all = EXPLORER_APARTMENTS;
    const avail = all.filter((a) => a.status === 'available').length;
    const maxFloors = Math.max(...district.buildings.map((b) => b.floors));
    return [
      { icon: Building2, label: 'Buildings', value: district.buildings.length },
      { icon: Home, label: 'Apartments', value: avail },
      { icon: Layers, label: 'Floors', value: maxFloors },
      { icon: CalendarCheck, label: 'Delivery', value: district.deliveryDate },
    ];
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-warm-bg">
      <Header />

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Residential district aerial view"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/65 to-primary/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--gold)/0.25)_0%,transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-4 pt-28 pb-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full glass text-accent text-[11px] font-semibold uppercase tracking-[0.3em] mb-6"
          >
            {district.tagline}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-gradient-gold text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6"
          >
            {district.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-primary-foreground/85 font-body text-base md:text-lg max-w-2xl mx-auto font-light tracking-wide mb-10"
          >
            {district.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            <Button
              size="lg"
              onClick={() => scrollTo(resultsRef)}
              className="rounded-full px-8 gradient-gold text-accent-foreground hover:shadow-glow-gold transition-all"
            >
              View apartments
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo(drilldownRef)}
              className="rounded-full px-8 glass text-primary-foreground border-white/30 hover:bg-white/10"
            >
              Explore buildings
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 glass text-primary-foreground border-white/30 hover:bg-white/10"
            >
              <a href="/#contact">Contact us</a>
            </Button>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl p-4 text-center hover:bg-white/10 transition"
              >
                <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="font-heading text-2xl md:text-3xl font-bold text-gradient-gold leading-none">
                  {s.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70 mt-1.5">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-bg to-transparent" />
      </section>

      {/* ───────── DISTRICT OVERVIEW ───────── */}
      <section ref={drilldownRef} className="container mx-auto px-4 py-16 md:py-24">
        <SectionHead
          eyebrow="District"
          title="Masterplan & buildings"
          subtitle="Pick a building on the map or from the grid to start exploring."
        />

        <div className="grid lg:grid-cols-5 gap-6 mt-10">
          <div className="lg:col-span-3">
            <Masterplan
              selectedId={selection.buildingId}
              onSelect={(b) =>
                update({
                  buildingId: b.id,
                  entranceId: b.entrances[0]?.id ?? null,
                  floor: null,
                  apartmentId: null,
                })
              }
            />
          </div>
          <div className="lg:col-span-2">
            <BuildingsGrid
              selectedId={selection.buildingId}
              onSelect={(b) =>
                update({
                  buildingId: b.id,
                  entranceId: b.entrances[0]?.id ?? null,
                  floor: null,
                  apartmentId: null,
                })
              }
            />
          </div>
        </div>
      </section>

      {/* ───────── BUILDING → ENTRANCE → FLOOR ───────── */}
      {building && (
        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <Breadcrumb selection={selection} onJump={clearFrom} />

          <SectionHead
            eyebrow={`Building ${building.name}`}
            title="Select entrance & floor"
            subtitle="Pick an entrance, then click a floor to see its apartments."
          />

          <div className="grid lg:grid-cols-12 gap-6 mt-8">
            {/* Entrance pills + facade */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  Entrances
                </p>
                <div className="flex flex-wrap gap-2">
                  {building.entrances.map((e) => (
                    <button
                      key={e.id}
                      onClick={() =>
                        update({ entranceId: e.id, floor: null, apartmentId: null })
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                        entranceId === e.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>

              {entranceId && (
                <BuildingFacade
                  building={building}
                  entranceId={entranceId}
                  apartments={EXPLORER_APARTMENTS.filter(
                    (a) => `${a.block}-${a.building}` === building.id,
                  )}
                  selectedFloor={selection.floor}
                  onSelectFloor={(floor) =>
                    update({ floor, apartmentId: null })
                  }
                />
              )}
            </div>

            {/* Floor plan */}
            <div className="lg:col-span-8">
              <FloorPlanViewer
                apartments={
                  selection.floor != null && entranceId
                    ? apartmentsIn(building.id, entranceId, selection.floor)
                    : []
                }
                selectedId={selection.apartmentId}
                onSelect={(apt) => {
                  update({ apartmentId: apt.id });
                  setDetailsApt(apt);
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ───────── FILTERS + GRID ───────── */}
      <section ref={resultsRef} className="container mx-auto px-4 pb-16 md:pb-24">
        <SectionHead
          eyebrow="Catalog"
          title="Browse all apartments"
          subtitle="Use advanced filters to narrow down the perfect home."
        />
        <div className="mt-8 space-y-6">
          <ApartmentFilters
            value={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            resultCount={filtered.length}
          />
          <ApartmentGrid
            apartments={filtered}
            onSelect={(apt) => {
              update({ apartmentId: apt.id });
              setDetailsApt(apt);
            }}
          />
        </div>
      </section>

      <Footer />
      <ChatWidget />

      <ApartmentDetailsSheet
        apartment={detailsApt}
        onClose={() => {
          setDetailsApt(null);
          update({ apartmentId: null });
        }}
        shareUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </div>
  );
};

/* ---------- helpers ---------- */

const SectionHead = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="text-center max-w-2xl mx-auto">
    <span className="text-[11px] uppercase tracking-[0.3em] text-accent-foreground/60 font-semibold">
      {eyebrow}
    </span>
    <h2 className="font-heading text-3xl md:text-5xl text-primary font-semibold mt-2">
      {title}
    </h2>
    {subtitle && (
      <p className="text-muted-foreground mt-3 font-body">{subtitle}</p>
    )}
  </div>
);

const Breadcrumb = ({
  selection,
  onJump,
}: {
  selection: ReturnType<typeof useExplorerUrlState>['selection'];
  onJump: ReturnType<typeof useExplorerUrlState>['clearFrom'];
}) => {
  const b = findBuilding(selection.buildingId);
  if (!b) return null;
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
      <button
        onClick={() => onJump('buildingId')}
        className="hover:text-primary transition"
      >
        District
      </button>
      <ChevronRight className="h-3.5 w-3.5" />
      <button
        onClick={() => onJump('entranceId')}
        className="hover:text-primary transition font-semibold text-primary"
      >
        {b.name}
      </button>
      {selection.entranceId && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <button
            onClick={() => onJump('floor')}
            className="hover:text-primary transition font-semibold text-primary"
          >
            Entrance {selection.entranceId}
          </button>
        </>
      )}
      {selection.floor != null && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-primary">Floor {selection.floor}</span>
        </>
      )}
    </nav>
  );
};

export default Explorer;
