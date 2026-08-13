import { useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { createLocationUnit, updateLocationUnit } from '@/api/warehouse';

type Args = {
  warehouseId: string;
  parentLocationUnitId?: string;
  locationUnitId?: string;
  initialName?: string;
  initialLabel?: string;
};

export function useLocationUnitForm({
  warehouseId,
  parentLocationUnitId,
  locationUnitId,
  initialName = '',
  initialLabel = '',
}: Args) {
  const [name, setName] = useState(initialName);
  const [label, setLabel] = useState(initialLabel);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(locationUnitId);

  const submit = async (): Promise<boolean> => {
    const trimmedName = name.trim();
    const trimmedLabel = label.trim();

    if (!trimmedName) {
      setError('Name is required.');
      return false;
    }

    setBusy(true);
    setError(null);
    try {
      const body = {
        name: trimmedName,
        label: trimmedLabel.length > 0 ? trimmedLabel : null,
        parentLocationUnitId: parentLocationUnitId ?? null,
      };
      if (locationUnitId) {
        await updateLocationUnit(warehouseId, locationUnitId, body);
      } else {
        await createLocationUnit(warehouseId, body);
      }
      return true;
    } catch (cause) {
      setError(apiErrorMessage(cause));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return {
    name,
    label,
    error,
    busy,
    isEdit,
    setName,
    setLabel,
    submit,
  };
}

export type UseLocationUnitFormResult = ReturnType<typeof useLocationUnitForm>;
