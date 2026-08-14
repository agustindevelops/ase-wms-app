import { useCallback, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  listFulfillmentOrders,
  type FulfillmentOrder,
  type OrderFulfillmentMode,
} from '@/api/order';

type Args = {
  mode: OrderFulfillmentMode;
};

export function formatEventDate(value: string | null): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return value;
  return day;
}

export function useOrderList({ mode }: Args) {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
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
        setOrders(await listFulfillmentOrders(mode));
      } catch (cause) {
        setOrders([]);
        setError(apiErrorMessage(cause));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mode],
  );

  return { orders, loading, refreshing, error, load };
}

export type UseOrderListResult = ReturnType<typeof useOrderList>;
