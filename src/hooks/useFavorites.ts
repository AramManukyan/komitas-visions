import { useCallback, useEffect, useState } from 'react';

const KEY = 'komitas:favorites:v1';

const read = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavorites(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setFavorites(new Set(next));
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* noop */
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persist(next);
    },
    [favorites, persist],
  );

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, isFavorite, toggle, count: favorites.size };
};
