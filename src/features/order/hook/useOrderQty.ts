import { useCallback, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  pickOrderLine,
  type FulfillmentOrder,
  type OrderFulfillmentMode,
} from '@/api/order';
import { useAppToast } from '@/components/ui/toast';

type Args = {
  orderId: string;
  mode: OrderFulfillmentMode;
  itemId: string;
  remaining: number;
};

export function useOrderQty({ orderId, mode, itemId, remaining }: Args) {
  const toast = useAppToast();
  const [qtyText, setQtyText] = useState(String(remaining));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedQty = Number(qtyText);
  const qtyValid =
    Number.isInteger(parsedQty) && parsedQty > 0 && parsedQty <= remaining;

  const assertQty = useCallback((): number | null => {
    const qty = Number(qtyText);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Enter a whole number greater than 0.');
      return null;
    }
    if (qty > remaining) {
      setError(`Cannot exceed remaining (${remaining}).`);
      return null;
    }
    return qty;
  }, [qtyText, remaining]);

  const submitPickup = useCallback(async (): Promise<FulfillmentOrder | null> => {
    const qty = assertQty();
    if (qty == null) return null;
    setBusy(true);
    setError(null);
    try {
      const order = await pickOrderLine(orderId, itemId, qty);
      toast.success(`Picked ${qty}.`);
      return order;
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setBusy(false);
    }
  }, [assertQty, itemId, orderId, toast]);

  return {
    mode,
    qtyText,
    setQtyText,
    busy,
    error,
    qtyValid,
    parsedQty,
    remaining,
    assertQty,
    submitPickup,
  };
}

export type UseOrderQtyResult = ReturnType<typeof useOrderQty>;
