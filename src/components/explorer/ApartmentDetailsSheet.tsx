import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DoorOpen, Heart, Home, Info, Layers, Map, Maximize2, MessageCircle, Sun, X } from 'lucide-react';
import { chatStore } from '@/hooks/useChatAttachments';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EXPLORER_APARTMENTS, type ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';
import apartmentPlan from '@/assets/apartment-plan.jpg';
import masterplanImg from '@/assets/explorer-masterplan.jpg';
import { OrientationCompass } from './OrientationCompass';

const STATUS_CLASSES: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  reserved: 'bg-amber-500/15 text-amber-700 border-amber-500/40',
  sold: 'bg-red-500/15 text-red-700 border-red-500/30',
};

const TAG_LABEL: Record<string, string> = {
  hot: 'explorer.tags.hot',
  discount: 'explorer.tags.discount',
  new: 'explorer.tags.new',
  premium: 'explorer.tags.premium',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

interface Props {
  apartment: ExplorerApartment | null;
  onClose: () => void;
  shareUrl?: string;
  onSelectApartment?: (apt: ExplorerApartment) => void;
}

const ApartmentDetailsSheet = ({ apartment, onClose, shareUrl, onSelectApartment }: Props) => {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(false);
  const [tab, setTab] = useState<'info' | 'plan'>('info');

  const floorInfo = useMemo(() => {
    if (!apartment) return { apts: [], totalArea: 0, available: 0 };
    const apts = EXPLORER_APARTMENTS.filter(
      (a) =>
        a.block === apartment.block &&
        a.building === apartment.building &&
        a.floor === apartment.floor,
    ).sort((a, b) => a.number.localeCompare(b.number));
    const totalArea = apts.reduce((s, a) => s + a.area, 0);
    const available = apts.filter((a) => a.status === 'available').length;
    return { apts, totalArea, available };
  }, [apartment]);

  if (!apartment) return null;


  return (
    <Dialog open={!!apartment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {t('explorer.apartmentNumber', { number: apartment.number })}
        </DialogTitle>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-3 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-primary hover:text-accent transition"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFavorite((v) => !v)}
            className="absolute top-4 right-14 z-10 h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-primary hover:text-accent transition"
            aria-label={t('common.save')}
          >
            <Heart className={cn('h-4 w-4', favorite && 'fill-accent text-accent')} />
          </button>

          <div className="flex items-end justify-between gap-3 pr-24">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-semibold mb-1">
                {t('explorer.apartment')}
              </p>
              <p className="font-heading text-primary text-3xl md:text-4xl font-bold leading-none">
                №{apartment.number}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Badge
                variant="outline"
                className={cn('border', STATUS_CLASSES[apartment.status], 'font-semibold')}
              >
                {t(`apartments.status.${apartment.status}`)}
              </Badge>
              {apartment.tag && (
                <Badge className="bg-accent text-accent-foreground border-0 font-bold tracking-wider">
                  {t(TAG_LABEL[apartment.tag])}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'info' | 'plan')} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="info" className="gap-2">
                <Info className="h-4 w-4" /> Apartment info
              </TabsTrigger>
              <TabsTrigger value="plan" className="gap-2">
                <Map className="h-4 w-4" /> Floor plan
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="m-0">
            <div className="p-6 md:p-8 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-muted rounded-2xl overflow-hidden border border-border"
              >
                <img
                  src={apartmentPlan}
                  alt={`Plan of apartment ${apartment.number}`}
                  className="absolute inset-0 w-full h-full object-contain p-4"
                />
                <div className="absolute top-3 right-3 z-10">
                  <OrientationCompass
                    orientation={apartment.orientation}
                    value={t(`explorer.orientation.${apartment.orientation}`)}
                    compact
                  />
                </div>
              </motion.div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <Stat icon={<Home className="h-4 w-4" />} label={t('apartments.card.rooms')} value={apartment.rooms} />
                <Stat
                  icon={<Maximize2 className="h-4 w-4" />}
                  label={t('apartments.card.area')}
                  value={`${apartment.area} m²`}
                />
                <Stat icon={<Layers className="h-4 w-4" />} label={t('apartments.card.floor')} value={apartment.floor} />
                <Stat
                  icon={<DoorOpen className="h-4 w-4" />}
                  label={t('apartments.card.location')}
                  value={`${apartment.block}/${apartment.building}/${apartment.entrance}`}
                />
                <Stat
                  icon={<Sun className="h-4 w-4" />}
                  label={t('explorer.details.balcony')}
                  value={apartment.balcony ? t('common.yes') : t('common.no')}
                />
                <OrientationCompass
                  orientation={apartment.orientation}
                  label={t('explorer.details.orientation')}
                  value={t(`explorer.orientation.${apartment.orientation}`)}
                  compact
                />
              </div>

              {/* Price */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t('apartments.card.price')}
                  </p>
                  <p className="font-heading text-4xl font-bold text-primary leading-tight">
                    {fmt(apartment.price)}{' '}
                    <span className="text-lg font-body text-muted-foreground font-medium">AMD</span>
                  </p>
                  {apartment.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      {fmt(apartment.originalPrice)} AMD
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t('explorer.details.perSqm')}
                  </p>
                  <p className="font-heading text-xl text-primary font-semibold">
                    {fmt(Math.round(apartment.price / apartment.area))} AMD
                  </p>
                </div>
              </div>


              {/* Actions */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Button
                  asChild
                  className="rounded-xl gradient-gold text-accent-foreground hover:shadow-glow-gold"
                >
                  <a href="#contact">
                    <Phone className="h-4 w-4" />
                    {t('explorer.actions.callback')}
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-accent/40 text-primary hover:bg-accent/10"
                  onClick={() => {
                    chatStore.addApartment(apartment);
                    onClose();
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Send via chat
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <a
                    href={`https://wa.me/?text=${message}%20${encodeURIComponent(link)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${message}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send className="h-4 w-4" />
                    Telegram
                  </a>
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="m-0">
            <div className="p-6 md:p-8 space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full aspect-[16/9] bg-muted rounded-2xl overflow-hidden border border-border"
              >
                <img
                  src={masterplanImg}
                  alt={`Whole floor plan — floor ${apartment.floor}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/0 to-background/0" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur border border-border text-[10px] uppercase tracking-wider font-bold text-primary">
                  Floor {apartment.floor} · Building {apartment.block}/{apartment.building}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-[11px] font-semibold text-primary">
                  <span className="px-2.5 py-1 rounded-full bg-background/85 backdrop-blur border border-border">
                    Entrance {apartment.entrance}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
                    Selected: №{apartment.number}
                  </span>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat icon={<Layers className="h-4 w-4" />} label={t('apartments.card.floor')} value={apartment.floor} />
                <Stat icon={<Home className="h-4 w-4" />} label="Apartments" value={floorInfo.apts.length} />
                <Stat icon={<Maximize2 className="h-4 w-4" />} label={t('explorer.filters.totalArea')} value={`${floorInfo.totalArea} m²`} />
                <Stat icon={<DoorOpen className="h-4 w-4" />} label="Available" value={`${floorInfo.available}/${floorInfo.apts.length}`} />
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                  Apartments on this floor
                </p>
                <div className="flex flex-wrap gap-2">
                  {floorInfo.apts.map((a) => {
                    const isCurrent = a.id === apartment.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          if (isCurrent) return;
                          onSelectApartment?.(a);
                        }}
                        aria-pressed={isCurrent}
                        aria-label={`Select apartment ${a.number}`}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all outline-none',
                          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                          isCurrent
                            ? 'bg-accent text-accent-foreground border-accent shadow-sm cursor-default'
                            : 'bg-card border-border text-primary hover:-translate-y-0.5 hover:border-accent hover:shadow-sm cursor-pointer',
                        )}
                      >
                        <span className="font-bold">№{a.number}</span>
                        <span className="opacity-70">·</span>
                        <span>{a.rooms} BR</span>
                        <span className="opacity-70">·</span>
                        <span>{a.area} m²</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider font-semibold mb-1">
      {icon}
      {label}
    </div>
    <div className="font-heading text-lg font-bold text-primary">{value}</div>
  </div>
);

export default ApartmentDetailsSheet;
