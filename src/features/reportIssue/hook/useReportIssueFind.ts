import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  fetchWarehouseItems,
  type CatalogItem,
} from '@/api/catalog';

type Args = {
  warehouseId: string;
};

export function locationLabel(item: CatalogItem): string | null {
  if (!item.locationUnit) return null;
  return item.locationUnit.label?.trim() || item.locationUnit.name.trim();
}

export function useReportIssueFind({ warehouseId }: Args) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery((current) => {
        const next = query.trim();
        return current === next ? current : next;
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        setItems(
          await fetchWarehouseItems(warehouseId, 'all', debouncedQuery),
        );
      } catch (cause) {
        setItems([]);
        setError(apiErrorMessage(cause));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedQuery, warehouseId],
  );

  return {
    query,
    setQuery,
    items,
    loading,
    refreshing,
    error,
    load,
  };
}

export type UseReportIssueFindResult = ReturnType<typeof useReportIssueFind>;
