import { useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { updateWarehouse } from '@/api/warehouse';

type Args = {
  warehouseId: string;
  initialName?: string;
};

export function useWarehouseForm({ warehouseId, initialName = '' }: Args) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<string | null> => {
    setBusy(true);
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      setBusy(false);
      return null;
    }

    try {
      const warehouse = await updateWarehouse(warehouseId, {
        name: trimmedName,
      });
      return warehouse.name;
    } catch (cause) {
      setError(apiErrorMessage(cause));
      return null;
    } finally {
      setBusy(false);
    }
  };

  return {
    name,
    error,
    busy,
    setName,
    submit,
  };
}

export type UseWarehouseFormResult = ReturnType<typeof useWarehouseForm>;
