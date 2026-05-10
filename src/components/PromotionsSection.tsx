import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PromotionBadge } from '@/components/PromotionBadge';
import { usePromotions, resolveValue } from '@/hooks/usePromotions';
import type { Promotion, PromotionType, PromotionVariant } from '@/types/promotion';
import { cn } from '@/lib/utils';

export interface PromotionsSectionProps {
  location?: string;
  projectId?: string;
  siteId?: string;
  type?: PromotionType[];
  variant?: PromotionVariant;
  limit?: number;
  sort?: 'priority' | 'newest' | 'endingSoon';
  showCountdown?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
}

/* ---------- countdown ---------- */
const useCountdown = (target?: string) => {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => tick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, [target]);
  if (!target) return null;
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return { d, h };
};

const Countdown = ({ endsAt }: { endsAt?: string }) => {
  const { t } = useTranslation();
  const c = useCountdown(endsAt);
  if (!c) return null;
  return (
    <span className="text-xs font-medium text-muted-foreground">
      {resolveValue('promotions.endsIn', t, 'Ends in')} {c.d}d {c.h}h
    </span>
  );
};

/* ---------- card ---------- */
const PromoCard = ({
  promo,
  showCountdown,
  className,
}: {
  promo: Promotion;
  showCountdown?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation();
  const title    = resolveValue(`${promo.i18nKey}.title`, t, '');
  const subtitle = resolveValue(`${promo.i18nKey}.subtitle`, t, '');
  const desc     = resolveValue(`${promo.i18nKey}.description`, t, '');
  const badge    = resolveValue(`${promo.i18nKey}.badge`, t, '');
  const cta      = resolveValue(`${promo.i18nKey}.cta`, t, '');

  return (
    <Card
      className={cn(
        'group h-full overflow-hidden border-border/60 transition-all hover:shadow-card-hover hover:-translate-y-1',
        className,
      )}
    >
      {promo.image && (
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={promo.image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {badge && (
            <div className="absolute left-3 top-3">
              <PromotionBadge type={promo.type} label={badge} />
            </div>
          )}
        </div>
      )}
      <CardContent className="p-5 space-y-2">
        <h3 className="font-heading text-xl text-navy leading-tight">{title}</h3>
        {subtitle && <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>}
        {desc && <p className="text-sm text-foreground/80 line-clamp-3">{desc}</p>}

        <div className="flex items-center justify-between pt-3">
          {promo.ctaHref && cta ? (
            <Button asChild size="sm" className="bg-navy text-gold hover:bg-navy-light">
              <a href={promo.ctaHref}>
                {cta} <ArrowRight />
              </a>
            </Button>
          ) : <span />}
          {showCountdown && <Countdown endsAt={promo.endsAt} />}
        </div>
      </CardContent>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-44 w-full rounded-none" />
    <CardContent className="p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </CardContent>
  </Card>
);

/* ---------- section ---------- */
export const PromotionsSection = ({
  location,
  projectId,
  siteId,
  type,
  variant = 'grid',
  limit,
  sort = 'priority',
  showCountdown = true,
  title,
  subtitle,
  className,
  loading,
}: PromotionsSectionProps) => {
  const { t } = useTranslation();
  const items = usePromotions({ location, projectId, siteId, type, sort, limit });

  const heading = title ?? resolveValue('promotions.sectionTitle', t, 'Special Offers');
  const sub = subtitle ?? resolveValue('promotions.sectionSubtitle', t, '');

  return (
    <section className={cn('py-16 md:py-24 bg-warm-bg', className)}>
      <div className="container">
        <div className="text-center mb-10 section-divider pt-6">
          <h2 className="font-heading text-3xl md:text-5xl text-navy mb-3">{heading}</h2>
          {sub && <p className="text-muted-foreground max-w-2xl mx-auto">{sub}</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {resolveValue('promotions.empty', t, 'No active promotions right now.')}
          </div>
        ) : variant === 'slider' ? (
          <Carousel opts={{ align: 'start' }} className="px-2">
            <CarouselContent>
              {items.map((p) => (
                <CarouselItem key={p.id} className="md:basis-1/2 lg:basis-1/3">
                  <PromoCard promo={p} showCountdown={showCountdown} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious><ChevronLeft /></CarouselPrevious>
            <CarouselNext><ChevronRight /></CarouselNext>
          </Carousel>
        ) : variant === 'list' ? (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            {items.map((p) => <PromoCard key={p.id} promo={p} showCountdown={showCountdown} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => <PromoCard key={p.id} promo={p} showCountdown={showCountdown} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromotionsSection;
