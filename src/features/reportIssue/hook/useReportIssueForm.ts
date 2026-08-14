import { useCallback, useEffect, useState } from 'react';
import { fetchCatalogItem } from '@/api/catalog';
import { apiErrorMessage } from '@/api/client';
import { createItemIssue, type IssueType } from '@/api/issue';
import { useAppToast } from '@/components/ui/toast';

type Args = {
  itemId: string;
};

export function useReportIssueForm({ itemId }: Args) {
  const toast = useAppToast();
  const [type, setType] = useState<IssueType>('MISSING');
  const [qtyText, setQtyText] = useState('1');
  const [notes, setNotes] = useState('');
  const [maxQty, setMaxQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const item = await fetchCatalogItem(itemId);
      const remaining = Math.min(item.quantityOwned, item.quantityAvailable);
      setMaxQty(remaining);
      if (remaining <= 0) {
        setError('No available quantity to report. Use Return Order if this item is out.');
      }
    } catch (cause) {
      setMaxQty(0);
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

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
      setError(`Cannot exceed available (${maxQty}).`);
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
    maxQty,
    loading,
    busy,
    error,
    load,
    submit,
  };
}

export type UseReportIssueFormResult = ReturnType<typeof useReportIssueForm>;
