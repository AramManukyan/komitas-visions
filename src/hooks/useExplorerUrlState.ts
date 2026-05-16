import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface ExplorerSelection {
  districtId: string | null;
  buildingId: string | null;
  entranceId: string | null;
  floor: number | null;
  apartmentId: string | null;
}

const KEYS = ['district', 'building', 'entrance', 'floor', 'apt'] as const;

/**
 * Reads/writes the deep-linkable selection state from URL search params.
 * Filters can stay local — this just covers the navigation flow.
 */
export const useExplorerUrlState = () => {
  const [params, setParams] = useSearchParams();

  const selection: ExplorerSelection = useMemo(
    () => ({
      districtId: params.get('district'),
      buildingId: params.get('building'),
      entranceId: params.get('entrance'),
      floor: params.get('floor') ? Number(params.get('floor')) : null,
      apartmentId: params.get('apt'),
    }),
    [params],
  );

  const update = useCallback(
    (next: Partial<ExplorerSelection>) => {
      const np = new URLSearchParams(params);
      const map: Record<keyof ExplorerSelection, (typeof KEYS)[number]> = {
        districtId: 'district',
        buildingId: 'building',
        entranceId: 'entrance',
        floor: 'floor',
        apartmentId: 'apt',
      };
      (Object.keys(next) as (keyof ExplorerSelection)[]).forEach((k) => {
        const v = next[k];
        if (v == null || v === '') np.delete(map[k]);
        else np.set(map[k], String(v));
      });
      setParams(np, { replace: false });
    },
    [params, setParams],
  );

  const clearFrom = useCallback(
    (level: keyof ExplorerSelection) => {
      const order: (keyof ExplorerSelection)[] = [
        'districtId',
        'buildingId',
        'entranceId',
        'floor',
        'apartmentId',
      ];
      const idx = order.indexOf(level);
      update(
        Object.fromEntries(order.slice(idx).map((k) => [k, null])) as Partial<ExplorerSelection>,
      );
    },
    [update],
  );

  return { selection, update, clearFrom };
};
