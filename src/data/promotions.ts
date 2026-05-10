import type { Promotion } from '@/types/promotion';

/**
 * Static promotions catalog. Translatable fields live under
 * `promotions.items.<id>` in each locale JSON (title/subtitle/description/badge/cta).
 */
export const promotions: Promotion[] = [
  {
    id: 'launch',
    type: 'new',
    i18nKey: 'promotions.items.launch',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    ctaHref: '#contact',
    locations: ['home', 'global', 'section'],
    startsAt: '2025-01-01',
    endsAt: '2026-12-31',
    priority: 100,
    popup: {
      enabled: true,
      showAfterSeconds: 6,
      showOncePerDay: true,
      showOnHomepageOnly: true,
    },
    topBanner: { enabled: true, sticky: true },
  },
  {
    id: 'mortgage',
    type: 'mortgage',
    i18nKey: 'promotions.items.mortgage',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    ctaHref: '#banks',
    locations: ['home', 'section'],
    startsAt: '2025-01-01',
    endsAt: '2026-06-30',
    priority: 80,
  },
  {
    id: 'installment',
    type: 'installment',
    i18nKey: 'promotions.items.installment',
    image:
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80',
    ctaHref: '#contact',
    locations: ['section'],
    startsAt: '2025-01-01',
    endsAt: '2026-09-30',
    priority: 60,
  },
];
