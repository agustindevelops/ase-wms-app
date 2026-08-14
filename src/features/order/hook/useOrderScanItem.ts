import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  QR_TYPE_ITEM,
  scanFulfillmentQr,
  type FulfillmentLine,
  type OrderFulfillmentMode,
} from '@/api/order';
import { useAppToast } from '@/components/ui/toast';
import { useScan } from '@/features/scan/hook/useScan';

type Args = {
  orderId: string;
  mode: OrderFulfillmentMode;
  onLine: (line: FulfillmentLine) => void;
};

export function useOrderScanItem({ orderId, mode, onLine }: Args) {
  const scan = useScan('qr');
  const toast = useAppToast();
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvingRef = useRef(false);
  const handled = useRef<string | null>(null);
  const onLineRef = useRef(onLine);
  onLineRef.current = onLine;

  const resolveFromPayload = useCallback(
    async (payload: string) => {
      if (resolvingRef.current) return;
      resolvingRef.current = true;
      setResolving(true);
      setError(null);
      try {
        const resolved = await scanFulfillmentQr(mode, orderId, payload);
        if (resolved.typeCode !== QR_TYPE_ITEM || !resolved.line) {
          throw new Error('That QR is not an item label. Scan an item QR.');
        }
        onLineRef.current(resolved.line);
      } catch (cause) {
        const message = apiErrorMessage(cause);
        setError(message);
        toast.error(message);
        handled.current = null;
        scan.scanAgain();
      } finally {
        resolvingRef.current = false;
        setResolving(false);
      }
    },
    [mode, orderId, scan.scanAgain, toast],
  );

  useEffect(() => {
    const data = scan.result?.data?.trim();
    if (!data || resolvingRef.current) return;
    if (handled.current === data) return;
    handled.current = data;
    void resolveFromPayload(data);
  }, [resolveFromPayload, scan.result]);

  return {
    ...scan,
    binding: resolving,
    error,
  };
}

export type UseOrderScanItemResult = ReturnType<typeof useOrderScanItem>;
