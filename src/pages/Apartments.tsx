import '../i18n';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, Home, Maximize2, Layers, DoorOpen, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { APARTMENTS, type Apartment, type ApartmentStatus } from '@/data/apartments';
import heroBg from '@/assets/hero-bg.jpg';

type FilterKey = 'block' | 'building' | 'entrance' | 'floor' | 'rooms';
type Filters = Record<FilterKey, string>; // 'all' = no filter

const ALL = 'all';
const initialFilters: Filters = {
  block: ALL,
  building: ALL,
  entrance: ALL,
  floor: ALL,
  rooms: ALL,
};

const formatPrice = (amd: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amd);

const STATUS_VARIANTS: Record<
  ApartmentStatus,
  { label: string; classes: string }
> = {
  available: {
    label: 'apartments.status.available',
    classes: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  },
  reserved: {
    label: 'apartments.status.reserved',
    classes: 'bg-amber-500/15 text-amber-700 border-amber-500/40',
  },
  sold: {
    label: 'apartments.status.sold',
    classes: 'bg-red-500/15 text-red-700 border-red-500/30',
  },
};

const uniqSorted = (vals: (string | number)[]) =>
  Array.from(new Set(vals)).sort((a, b) =>
    typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
  );

const Apartments = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [details, setDetails] = useState<Apartment | null>(null);

  // Cascading options: each filter narrows the next ones
  const matches = (apt: Apartment, ignore?: FilterKey) =>
    (ignore === 'block' || filters.block === ALL || apt.block === filters.block) &&
    (ignore === 'building' || filters.building === ALL || apt.building === filters.building) &&
    (ignore === 'entrance' || filters.entrance === ALL || apt.entrance === filters.entrance) &&
    (ignore === 'floor' || filters.floor === ALL || String(apt.floor) === filters.floor) &&
    (ignore === 'rooms' || filters.rooms === ALL || String(apt.rooms) === filters.rooms);

  const options = useMemo(() => {
    return {
      block: uniqSorted(APARTMENTS.filter((a) => matches(a, 'block')).map((a) => a.block)),
      building: uniqSorted(
        APARTMENTS.filter((a) => matches(a, 'building')).map((a) => a.building)
      ),
      entrance: uniqSorted(
        APARTMENTS.filter((a) => matches(a, 'entrance')).map((a) => a.entrance)
      ),
      floor: uniqSorted(APARTMENTS.filter((a) => matches(a, 'floor')).map((a) => a.floor)),
      rooms: uniqSorted(APARTMENTS.filter((a) => matches(a, 'rooms')).map((a) => a.rooms)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const filtered = useMemo(() => APARTMENTS.filter((a) => matches(a)), [filters]);

  const setFilter = (key: FilterKey, value: string) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Reset dependent filters when an upstream changes (cascading)
      const cascadeOrder: FilterKey[] = ['block', 'building', 'entrance', 'floor'];
      const idx = cascadeOrder.indexOf(key);
      if (idx >= 0) {
        for (let i = idx + 1; i < cascadeOrder.length; i++) next[cascadeOrder[i]] = ALL;
      }
      return next;
    });

  const reset = () => setFilters(initialFilters);

  const FilterSelect = ({
    name,
    value,
    onChange,
    items,
    placeholder,
  }: {
    name: string;
    value: string;
    onChange: (v: string) => void;
    items: (string | number)[];
    placeholder: string;
  }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {name}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-background border-border h-11 rounded-xl">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {items.map((it) => (
            <SelectItem key={String(it)} value={String(it)}>
              {String(it)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-bg">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt={t('apartments.hero.imageAlt')}
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/65 to-primary/85" />
        <div className="relative z-10 container mx-auto px-4 text-center pt-28 pb-16">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="w-16 h-[2px] gradient-gold mx-auto mb-8"
          />
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-heading text-gradient-gold text-5xl md:text-7xl font-bold leading-[1] mb-6"
          >
            {t('apartments.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-primary-foreground/85 font-body text-base md:text-lg max-w-2xl mx-auto font-light tracking-wide"
          >
            {t('apartments.hero.subtitle')}
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warm-bg to-transparent" />
      </section>

      {/* Filters + Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl shadow-soft p-5 md:p-6 mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
              <FilterSelect
                name={t('apartments.filters.block')}
                value={filters.block}
                onChange={(v) => setFilter('block', v)}
                items={options.block}
                placeholder={t('apartments.filters.selectBlock')}
              />
              <FilterSelect
                name={t('apartments.filters.building')}
                value={filters.building}
                onChange={(v) => setFilter('building', v)}
                items={options.building}
                placeholder={t('apartments.filters.selectBuilding')}
              />
              <FilterSelect
                name={t('apartments.filters.entrance')}
                value={filters.entrance}
                onChange={(v) => setFilter('entrance', v)}
                items={options.entrance}
                placeholder={t('apartments.filters.selectEntrance')}
              />
              <FilterSelect
                name={t('apartments.filters.floor')}
                value={filters.floor}
                onChange={(v) => setFilter('floor', v)}
                items={options.floor}
                placeholder={t('apartments.filters.selectFloor')}
              />
              <FilterSelect
                name={t('apartments.filters.rooms')}
                value={filters.rooms}
                onChange={(v) => setFilter('rooms', v)}
                items={options.rooms}
                placeholder={t('apartments.filters.selectRooms')}
              />
            </div>
            <Button
              variant="outline"
              onClick={reset}
              className="h-11 rounded-xl gap-2 border-border hover:bg-accent/20 hover:text-accent-foreground hover:border-accent shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              {t('apartments.filters.reset')}
            </Button>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-heading text-2xl md:text-3xl text-primary font-semibold">
            {t('apartments.results.title')}
          </h2>
          <span className="text-sm text-muted-foreground font-body">
            {t('apartments.results.count', { count: filtered.length })}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-soft">
            <p className="font-heading text-2xl text-primary mb-2">
              {t('apartments.empty.title')}
            </p>
            <p className="text-muted-foreground mb-6">{t('apartments.empty.subtitle')}</p>
            <Button onClick={reset} variant="outline" className="rounded-xl gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('apartments.filters.reset')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.slice(0, 60).map((apt, i) => {
              const status = STATUS_VARIANTS[apt.status];
              return (
                <motion.article
                  key={apt.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -50px 0px' }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.02, 0.3) }}
                  className="group bg-card border border-border rounded-2xl shadow-soft overflow-hidden flex flex-col hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-32 gradient-navy flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--gold))_0%,transparent_50%)]" />
                    <div className="relative text-center">
                      <p className="text-primary-foreground/60 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">
                        {t('apartments.card.unit')}
                      </p>
                      <p className="font-heading text-gradient-gold text-3xl font-bold leading-none">
                        №{apt.number}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`absolute top-3 right-3 border ${status.classes} font-semibold`}
                    >
                      {t(status.label)}
                    </Badge>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <ul className="space-y-2.5 mb-5 text-sm">
                      <li className="flex items-center justify-between text-foreground/80">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Home className="h-4 w-4 text-accent-foreground/60" />
                          {t('apartments.card.rooms')}
                        </span>
                        <span className="font-semibold text-primary">{apt.rooms}</span>
                      </li>
                      <li className="flex items-center justify-between text-foreground/80">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Layers className="h-4 w-4 text-accent-foreground/60" />
                          {t('apartments.card.floor')}
                        </span>
                        <span className="font-semibold text-primary">{apt.floor}</span>
                      </li>
                      <li className="flex items-center justify-between text-foreground/80">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Maximize2 className="h-4 w-4 text-accent-foreground/60" />
                          {t('apartments.card.area')}
                        </span>
                        <span className="font-semibold text-primary">{apt.area} m²</span>
                      </li>
                      <li className="flex items-center justify-between text-foreground/80">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <DoorOpen className="h-4 w-4 text-accent-foreground/60" />
                          {t('apartments.card.location')}
                        </span>
                        <span className="font-semibold text-primary">
                          {apt.block}/{apt.building}/{apt.entrance}
                        </span>
                      </li>
                    </ul>

                    <div className="mt-auto">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {t('apartments.card.price')}
                      </p>
                      <p className="font-heading text-2xl font-bold text-primary mb-4">
                        {formatPrice(apt.price)} <span className="text-base font-body font-medium text-muted-foreground">AMD</span>
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl border-border hover:border-accent hover:bg-accent/15"
                          onClick={() => setDetails(apt)}
                        >
                          {t('apartments.card.details')}
                        </Button>
                        <Button
                          asChild
                          disabled={apt.status === 'sold'}
                          className="flex-1 rounded-xl gradient-gold text-accent-foreground hover:shadow-glow-gold transition-all"
                        >
                          <Link to={`/?apt=${apt.number}#contact`}>
                            {t('apartments.card.reserve')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
      <ChatWidget />

      {/* Details modal */}
      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          {details && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-3xl text-primary">
                  {t('apartments.card.unit')} №{details.number}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className={`border ${STATUS_VARIANTS[details.status].classes} font-semibold`}
                >
                  {t(STATUS_VARIANTS[details.status].label)}
                </Badge>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm pt-2">
                  <div>
                    <dt className="text-muted-foreground">{t('apartments.filters.block')}</dt>
                    <dd className="font-semibold text-primary">{details.block}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('apartments.filters.building')}</dt>
                    <dd className="font-semibold text-primary">{details.building}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('apartments.filters.entrance')}</dt>
                    <dd className="font-semibold text-primary">{details.entrance}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('apartments.filters.floor')}</dt>
                    <dd className="font-semibold text-primary">{details.floor}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('apartments.card.rooms')}</dt>
                    <dd className="font-semibold text-primary">{details.rooms}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('apartments.card.area')}</dt>
                    <dd className="font-semibold text-primary">{details.area} m²</dd>
                  </div>
                </dl>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {t('apartments.card.price')}
                  </p>
                  <p className="font-heading text-3xl font-bold text-primary">
                    {formatPrice(details.price)}{' '}
                    <span className="text-lg font-body font-medium text-muted-foreground">AMD</span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setDetails(null)}
                  >
                    <X className="h-4 w-4" />
                    {t('apartments.modal.close')}
                  </Button>
                  <Button
                    asChild
                    disabled={details.status === 'sold'}
                    className="flex-1 rounded-xl gradient-gold text-accent-foreground hover:shadow-glow-gold"
                  >
                    <Link to={`/?apt=${details.number}#contact`}>
                      {t('apartments.card.reserve')}
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Apartments;
