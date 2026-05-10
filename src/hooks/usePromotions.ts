import { useMemo } from 'react';
import { promotions as ALL } from '@/data/promotions';
import type { Promotion, PromotionFilter } from '@/types/promotion';

const isActive = (p: Promotion, now = new Date()) => {
  const startOk = !p.startsAt || new Date(p.startsAt) <= now;
  const endOk = !p.endsAt || new Date(p.endsAt) >= now;
  return startOk && endOk;
};

export function usePromotions(filter: PromotionFilter = {}): Promotion[] {
  return useMemo(() => {
    const now = new Date();
    let list = ALL.filter((p) => isActive(p, now));

    if (filter.location) {
      list = list.filter((p) => p.locations?.includes(filter.location!));
    }
    if (filter.projectId) {
      list = list.filter((p) => !p.projectId || p.projectId === filter.projectId);
    }
    if (filter.siteId) {
      list = list.filter((p) => !p.siteId || p.siteId === filter.siteId);
    }
    if (filter.type?.length) {
      list = list.filter((p) => filter.type!.includes(p.type));
    }

    const sort = filter.sort ?? 'priority';
    list = [...list].sort((a, b) => {
      if (sort === 'priority') return (b.priority ?? 0) - (a.priority ?? 0);
      if (sort === 'newest') {
        return (
          new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime()
        );
      }
      // endingSoon
      const ae = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
      const be = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
      return ae - be;
    });

    if (filter.limit) list = list.slice(0, filter.limit);
    return list;
  }, [filter.location, filter.projectId, filter.siteId, filter.type?.join(','), filter.sort, filter.limit]);
}

/** Helper resolving an i18n field with a fallback. */
export function resolveValue(
  field: string,
  tr: (k: string, opts?: Record<string, unknown>) => string,
  fallback = ''
): string {
  const v = tr(field, { defaultValue: fallback });
  return v === field ? fallback : v;
}
