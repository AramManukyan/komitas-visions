import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X,
  Heart,
  Phone,
  MessageCircle,
  Send,
  Download,
  Calculator,
  Maximize2,
  Home,
  Layers,
  DoorOpen,
  Sun,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import type { ExplorerApartment } from '@/data/explorer';
import { cn } from '@/lib/utils';
import apartmentPlan from '@/assets/apartment-plan.jpg';

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
}

const ApartmentDetailsSheet = ({ apartment, onClose, shareUrl }: Props) => {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(false);
  const [downpayment, setDownpayment] = useState(20);
  const [years, setYears] = useState(15);

  const monthly = useMemo(() => {
    if (!apartment) return 0;
    const loan = apartment.price * (1 - downpayment / 100);
    const rate = 0.105 / 12;
    const n = years * 12;
    return Math.round((loan * rate) / (1 - Math.pow(1 + rate, -n)));
  }, [apartment, downpayment, years]);

  if (!apartment) return null;

  const message = encodeURIComponent(
    `Hi! I'm interested in apartment №${apartment.number} (${apartment.rooms} rm, ${apartment.area} m²).`,
  );
  const link = shareUrl ?? window.location.href;

  return (
    <Dialog open={!!apartment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {t('explorer.apartmentNumber', { number: apartment.number })}
        </DialogTitle>

        {/* Hero band */}
        <div className="relative h-56 gradient-navy flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--gold))_0%,transparent_60%)]" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass-dark flex items-center justify-center text-primary-foreground hover:text-accent transition"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFavorite((v) => !v)}
            className="absolute top-4 right-16 z-10 h-9 w-9 rounded-full glass-dark flex items-center justify-center text-primary-foreground hover:text-accent transition"
            aria-label={t('common.save')}
          >
            <Heart className={cn('h-4 w-4', favorite && 'fill-accent text-accent')} />
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center relative"
          >
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-[0.3em] font-semibold mb-2">
              {t('explorer.apartment')}
            </p>
            <p className="font-heading text-gradient-gold text-6xl font-bold leading-none">
              №{apartment.number}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
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
          </motion.div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={<Home className="h-4 w-4" />} label={t('apartments.card.rooms')} value={apartment.rooms} />
            <Stat icon={<Maximize2 className="h-4 w-4" />} label="Area" value={`${apartment.area} m²`} />
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
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {t('apartments.card.price')}
              </p>
              <p className="font-heading text-4xl font-bold text-primary leading-tight">
                {fmt(apartment.price)}{' '}
                <span className="text-lg font-body text-muted-foreground font-medium">
                  AMD
                </span>
              </p>
              {apartment.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {fmt(apartment.originalPrice)} AMD
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Per m²
              </p>
              <p className="font-heading text-xl text-primary font-semibold">
                {fmt(Math.round(apartment.price / apartment.area))} AMD
              </p>
            </div>
          </div>

          {/* Mortgage calc */}
          <div className="rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-accent-foreground/70" />
              <p className="font-heading text-lg text-primary">{t('explorer.mortgage.title')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t('explorer.mortgage.downPayment')}</span>
                  <span className="font-semibold text-primary">{downpayment}%</span>
                </div>
                <Slider
                  min={10}
                  max={50}
                  step={5}
                  value={[downpayment]}
                  onValueChange={(v) => setDownpayment(v[0])}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t('explorer.mortgage.term')}</span>
                  <span className="font-semibold text-primary">
                    {years} {t('explorer.mortgage.years')}
                  </span>
                </div>
                <Slider
                  min={5}
                  max={30}
                  step={1}
                  value={[years]}
                  onValueChange={(v) => setYears(v[0])}
                />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">{t('explorer.mortgage.estimatedMonthly')}</span>
              <span className="font-heading text-2xl font-bold text-primary">
                {fmt(monthly)} AMD
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              asChild
              className="rounded-xl gradient-gold text-accent-foreground hover:shadow-glow-gold"
            >
              <a href="#contact">
                <Phone className="h-4 w-4" />
                {t('explorer.actions.callback')}
              </a>
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
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
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
