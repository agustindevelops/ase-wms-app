import { useCallback, useEffect, useState } from 'react';
import { fetchCatalogItem, fetchWarehouseItems } from '@/api/catalog';
import { apiErrorMessage } from '@/api/client';
import { createItemIssue, type IssueType } from '@/api/issue';
import { useAppToast } from '@/components/ui/toast';

type Args = {
  itemId: string;
  warehouseId: string;
};

export function useReportIssueForm({ itemId, warehouseId }: Args) {
  const toast = useAppToast();
  const [type, setType] = useState<IssueType>('MISSING');
  const [qtyText, setQtyText] = useState('1');
  const [notes, setNotes] = useState('');
  const [ownedQty, setOwnedQty] = useState(0);
  const [maxQty, setMaxQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const warehouseItems = await fetchWarehouseItems(warehouseId, 'all');
      const item =
        warehouseItems.find((row) => row.id === itemId) ??
        (await fetchCatalogItem(itemId));
      const owned = item.quantityOwned;
      setOwnedQty(owned);
      setMaxQty(owned);
      if (owned <= 0) {
        setError('No quantity to report.');
      }
    } catch (cause) {
      setOwnedQty(0);
      setMaxQty(0);
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [itemId, warehouseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = useCallback(async (): Promise<boolean> => {
    const quantity = Number(qtyText);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Enter a whole number greater than 0.');
      return false;
    }
    if (quantity > maxQty) {
      setError(`Cannot exceed inventory quantity (${maxQty}).`);
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      await createItemIssue(itemId, {
        type,
        quantity,
        notes: notes.trim() || null,
      });
      toast.success(`Reported ${quantity} ${type.toLowerCase()}.`);
      return true;
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  }, [itemId, maxQty, notes, qtyText, toast, type]);

  return {
    type,
    setType,
    qtyText,
    setQtyText,
    notes,
    setNotes,
    ownedQty,
    maxQty,
    loading,
    refreshing,
    busy,
    error,
    load,
    submit,
  };
}

export type UseReportIssueFormResult = ReturnType<typeof useReportIssueForm>;
