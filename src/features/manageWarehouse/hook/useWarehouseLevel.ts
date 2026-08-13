import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { apiErrorMessage } from '@/api/client';
import {
  deleteLocationUnit,
  fetchLocationUnit,
  fetchWarehouseRoot,
  formatWarehouseAddress,
  type LocationUnit,
  type Warehouse,
} from '@/api/warehouse';

type Args = {
  warehouseId: string;
  parentLocationUnitId?: string;
};

export function useWarehouseLevel({ warehouseId, parentLocationUnitId }: Args) {
  const [units, setUnits] = useState<LocationUnit[]>([]);
  const [currentUnit, setCurrentUnit] = useState<LocationUnit | null>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [addressText, setAddressText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        if (parentLocationUnitId) {
          const detail = await fetchLocationUnit(
            warehouseId,
            parentLocationUnitId,
          );
          const unit = {
            ...detail.locationUnit,
            qrCode: detail.locationUnit.qrCode ?? detail.qrCode,
          };
          setCurrentUnit(unit);
          setWarehouse(null);
          setUnits(detail.children);
          setAddressText(null);
        } else {
          const root = await fetchWarehouseRoot(warehouseId);
          setCurrentUnit(null);
          setWarehouse(root.warehouse);
          setUnits(root.locationUnits);
          setAddressText(formatWarehouseAddress(root.warehouse.address));
        }
      } catch (cause) {
        setUnits([]);
        setCurrentUnit(null);
        setError(apiErrorMessage(cause));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [parentLocationUnitId, warehouseId],
  );

  const confirmDelete = (unit: LocationUnit) => {
    Alert.alert(
      'Delete location?',
      `Delete "${unit.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setDeletingId(unit.id);
              setError(null);
              try {
                await deleteLocationUnit(warehouseId, unit.id);
                await load('refresh');
              } catch (cause) {
                setError(apiErrorMessage(cause));
              } finally {
                setDeletingId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const applyLocationUnit = useCallback((next: LocationUnit) => {
    setCurrentUnit((current) =>
      current?.id === next.id ? next : current,
    );
    setUnits((list) =>
      list.map((unit) => (unit.id === next.id ? next : unit)),
    );
  }, []);

  return {
    units,
    currentUnit,
    warehouse,
    addressText,
    error,
    loading,
    refreshing,
    deletingId,
    load,
    confirmDelete,
    applyLocationUnit,
    setError,
  };
}

export type UseWarehouseLevelResult = ReturnType<typeof useWarehouseLevel>;
