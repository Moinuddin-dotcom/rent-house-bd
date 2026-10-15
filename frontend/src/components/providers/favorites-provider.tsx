'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';

export interface FavoritesContextValue {
  ids: Set<string>;
  isFavorite: (listingId: string) => boolean;
  toggle: (listingId: string) => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Keeps the logged-in user's favourite listing ids in memory for instant heart toggles. */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    api<string[]>('/favorites/ids')
      .then((list) => setIds(new Set(list)))
      .catch(() => setIds(new Set()));
  }, [user]);

  const toggle = useCallback(
    async (listingId: string) => {
      if (!user) {
        toast.info('Log in to save favourites');
        return;
      }
      const wasFavorite = ids.has(listingId);
      const next = new Set(ids);
      if (wasFavorite) next.delete(listingId);
      else next.add(listingId);
      setIds(next);

      try {
        await api(`/favorites/${listingId}`, { method: wasFavorite ? 'DELETE' : 'POST' });
      } catch (error) {
        setIds(ids); // roll back the optimistic update
        toast.error((error as Error).message);
      }
    },
    [ids, user],
  );

  const value = useMemo(() => ({ ids, isFavorite: (id: string) => ids.has(id), toggle }), [ids, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
