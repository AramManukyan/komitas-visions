import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromotionBadge } from '@/components/PromotionBadge';
import { resolveValue } from '@/hooks/usePromotions';
import type { Promotion } from '@/types/promotion';

interface PromoPopupProps {
  promotion: Promotion;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export const PromoPopup = ({ promotion }: PromoPopupProps) => {
  const { t } = useTranslation();
  const cfg = promotion.popup ?? {};
  const storageKey = `promo-popup:${promotion.id}`;
  const [open, setOpen] = useState(false);

  const expired = useMemo(
    () => !!promotion.endsAt && new Date(promotion.endsAt) < new Date(),
    [promotion.endsAt],
  );

  useEffect(() => {
    if (cfg.enabled === false || expired) return;
    if (cfg.showOnHomepageOnly && window.location.pathname !== '/' && window.location.hash !== '' && window.location.hash !== '#/') {
      return;
    }

    let shown = false;
    const canShow = () => {
      try {
        const last = localStorage.getItem(storageKey);
        if (cfg.showOncePerDay && last === todayKey()) return false;
        if (!cfg.showOncePerDay && last === '1') return false;
      } catch { /* ignore */ }
      return true;
    };

    const show = () => {
      if (shown || !canShow()) return;
      shown = true;
      setOpen(true);
      try { localStorage.setItem(storageKey, cfg.showOncePerDay ? todayKey() : '1'); }
      catch { /* ignore */ }
    };

    const delay = (cfg.showAfterSeconds ?? 5) * 1000;
    const timer = window.setTimeout(show, delay);

    let onLeave: ((e: MouseEvent) => void) | undefined;
    if (cfg.exitIntent) {
      onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
      document.addEventListener('mouseleave', onLeave);
    }

    return () => {
      window.clearTimeout(timer);
      if (onLeave) document.removeEventListener('mouseleave', onLeave);
    };
  }, [cfg.enabled, cfg.showAfterSeconds, cfg.showOncePerDay, cfg.exitIntent, cfg.showOnHomepageOnly, expired, storageKey]);

  if (!open || expired) return null;

  const title    = resolveValue(`${promotion.i18nKey}.title`, t, '');
  const subtitle = resolveValue(`${promotion.i18nKey}.subtitle`, t, '');
  const desc     = resolveValue(`${promotion.i18nKey}.description`, t, '');
  const badge    = resolveValue(`${promotion.i18nKey}.badge`, t, '');
  const cta      = resolveValue(`${promotion.i18nKey}.cta`, t, '');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm animate-fade-up"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card text-card-foreground shadow-elevated"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors"
        >
          <X className="size-4" />
        </button>

        {promotion.image && (
          <div className="relative h-48 md:h-56 w-full overflow-hidden">
            <img src={promotion.image} alt={title} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
            {badge && (
              <div className="absolute left-4 top-4">
                <PromotionBadge type={promotion.type} label={badge} />
              </div>
            )}
          </div>
        )}

        <div className="p-6 space-y-3">
          <h3 className="font-heading text-2xl text-navy">{title}</h3>
          {subtitle && <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>}
          {desc && <p className="text-sm leading-relaxed text-foreground/80">{desc}</p>}
          {promotion.ctaHref && cta && (
            <Button asChild className="w-full mt-2 bg-navy text-gold hover:bg-navy-light">
              <a href={promotion.ctaHref} onClick={() => setOpen(false)}>
                {cta} <ArrowRight />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;
