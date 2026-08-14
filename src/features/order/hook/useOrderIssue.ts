import { useCallback, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { reportReturnIssue, type FulfillmentOrder } from '@/api/order';
import { useAppToast } from '@/components/ui/toast';

type IssueType = 'MISSING' | 'BROKEN';

type Args = {
  orderId: string;
  itemId: string;
  remaining: number;
};

export function useOrderIssue({ orderId, itemId, remaining }: Args) {
  const toast = useAppToast();
  const [type, setType] = useState<IssueType>('MISSING');
  const [qtyText, setQtyText] = useState(String(remaining));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (): Promise<FulfillmentOrder | null> => {
    const quantity = Number(qtyText);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Enter a whole number greater than 0.');
      return null;
    }
    if (quantity > remaining) {
      setError(`Cannot exceed outstanding (${remaining}).`);
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const order = await reportReturnIssue(orderId, {
        itemId,
        type,
        quantity,
        notes: notes.trim() || null,
      });
      toast.success(`Reported ${quantity} ${type.toLowerCase()}.`);
      return order;
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setBusy(false);
    }
  }, [itemId, notes, orderId, qtyText, remaining, toast, type]);

  return {
    type,
    setType,
    qtyText,
    setQtyText,
    notes,
    setNotes,
    busy,
    error,
    remaining,
    submit,
  };
}

export type UseOrderIssueResult = ReturnType<typeof useOrderIssue>;
