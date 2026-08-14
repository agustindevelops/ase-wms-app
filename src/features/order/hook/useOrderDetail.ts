import { useCallback, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  getFulfillmentOrder,
  type FulfillmentLine,
  type FulfillmentOrder,
  type OrderFulfillmentMode,
} from '@/api/order';

type Args = {
  mode: OrderFulfillmentMode;
  orderId: string;
};

export function remainingForMode(
  line: FulfillmentLine,
  mode: OrderFulfillmentMode,
): number {
  return mode === 'pickup' ? line.qtyRemaining : line.qtyOutstanding;
}

export function returnLocationText(
  locationLabel: string | null | undefined,
): string | null {
  const place = locationLabel?.trim();
  return place || null;
}

export function useOrderDetail({ mode, orderId }: Args) {
  const [order, setOrder] = useState<FulfillmentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
        setOrder(await getFulfillmentOrder(mode, orderId));
      } catch (cause) {
        setOrder(null);
        setError(apiErrorMessage(cause));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mode, orderId],
  );

  return { order, loading, refreshing, error, load };
}

export type UseOrderDetailResult = ReturnType<typeof useOrderDetail>;
