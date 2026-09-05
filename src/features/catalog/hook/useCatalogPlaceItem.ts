import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { fetchCatalogItem, itemPhotoUrl } from '@/api/catalog';

type Args = {
  itemId: string;
};

export function useCatalogPlaceItem({ itemId }: Args) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const item = await fetchCatalogItem(itemId);
      setPhotoUrl(itemPhotoUrl(item));
    } catch (cause) {
      console.warn('Failed to load item photo:', apiErrorMessage(cause));
      setPhotoUrl(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { photoUrl, loading, refreshing, load };
}

export type UseCatalogPlaceItemResult = ReturnType<typeof useCatalogPlaceItem>;
