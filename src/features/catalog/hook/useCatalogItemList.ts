import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { apiErrorMessage } from '@/api/client';
import {
  fetchWarehouseItems,
  unbindItemLocation,
  type CatalogItem,
  type WarehouseItemLocationFilter,
} from '@/api/catalog';
import { useAppToast } from '@/components/ui/toast';

export type CatalogItemListMode = 'add' | 'move' | 'remove';

type Args = {
  warehouseId: string;
  mode: CatalogItemListMode;
};

function locationFilter(mode: CatalogItemListMode): WarehouseItemLocationFilter {
  return mode === 'add' ? 'none' : 'set';
}

export function locationLabel(item: CatalogItem): string | null {
  if (!item.locationUnit) return null;
  return item.locationUnit.label?.trim() || item.locationUnit.name.trim();
}

export function useCatalogItemList({ warehouseId, mode }: Args) {
  const toast = useAppToast();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        setItems(await fetchWarehouseItems(warehouseId, locationFilter(mode)));
      } catch (cause) {
        setItems([]);
        setError(apiErrorMessage(cause));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mode, warehouseId],
  );

  const confirmRemove = useCallback(
    (item: CatalogItem, onRemoved: () => void) => {
      const place = locationLabel(item);
      Alert.alert(
        'Remove from location?',
        place
          ? `Detach "${item.name}" from ${place}? The item stays in the catalog.`
          : `Detach "${item.name}" from its location? The item stays in the catalog.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                setBusyId(item.id);
                try {
                  await unbindItemLocation(warehouseId, item.id);
                  toast.success(`Removed ${item.name} from its location.`);
                  onRemoved();
                } catch (cause) {
                  toast.error(apiErrorMessage(cause));
                } finally {
                  setBusyId(null);
                }
              })();
            },
          },
        ],
      );
    },
    [toast, warehouseId],
  );

  return {
    items,
    loading,
    refreshing,
    busyId,
    error,
    load,
    confirmRemove,
  };
}

export type UseCatalogItemListResult = ReturnType<typeof useCatalogItemList>;
