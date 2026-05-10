import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveValue } from '@/hooks/usePromotions';
import type { Promotion } from '@/types/promotion';

interface PromoTopBannerProps {
  promotion: Promotion;
  sticky?: boolean;
}

export const PromoTopBanner = ({ promotion, sticky }: PromoTopBannerProps) => {
  const { t } = useTranslation();
  const storageKey = `promo-banner-dismissed:${promotion.id}`;
  const [open, setOpen] = useState(false);

  const expired = useMemo(
    () => !!promotion.endsAt && new Date(promotion.endsAt) < new Date(),
    [promotion.endsAt],
  );

  useEffect(() => {
    if (expired) return;
    try {
      if (localStorage.getItem(storageKey) !== '1') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [storageKey, expired]);

  if (!open || expired) return null;

  const title = resolveValue(`${promotion.i18nKey}.banner`, t,
    resolveValue(`${promotion.i18nKey}.title`, t, ''));
  const cta = resolveValue(`${promotion.i18nKey}.cta`, t, '');

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
  };

  const isSticky = sticky ?? promotion.topBanner?.sticky;

  return (
    <div
      role="region"
      aria-label="Promotion banner"
      className={cn(
        'w-full gradient-gold text-navy shadow-elevated animate-fade-up z-[60]',
        isSticky && 'sticky top-0',
      )}
    >
      <div className="container flex items-center justify-between gap-3 py-2.5">
        <p className="text-sm md:text-base font-medium truncate">
          {title}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {promotion.ctaHref && cta && (
            <Button
              asChild
              size="sm"
              variant="default"
              className="bg-navy text-gold hover:bg-navy-light"
            >
              <a href={promotion.ctaHref}>
                {cta} <ArrowRight />
              </a>
            </Button>
          )}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="p-1.5 rounded-full hover:bg-navy/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoTopBanner;
