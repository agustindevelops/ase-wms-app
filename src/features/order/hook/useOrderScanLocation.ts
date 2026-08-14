import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  QR_TYPE_LOCATION,
  returnOrderLine,
  scanFulfillmentQr,
  type FulfillmentOrder,
} from '@/api/order';
import { useAppToast } from '@/components/ui/toast';
import { useScan } from '@/features/scan/hook/useScan';

type Args = {
  orderId: string;
  itemId: string;
  qty: number;
  locationLabel?: string | null;
  onDone: (order: FulfillmentOrder) => void;
};

export function useOrderScanLocation({
  orderId,
  itemId,
  qty,
  locationLabel,
  onDone,
}: Args) {
  const scan = useScan('qr');
  const toast = useAppToast();
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bindingRef = useRef(false);
  const handled = useRef<string | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const resolveFromPayload = useCallback(
    async (payload: string) => {
      if (bindingRef.current) return;
      bindingRef.current = true;
      setBinding(true);
      setError(null);
      try {
        const resolved = await scanFulfillmentQr(
          'return',
          orderId,
          payload,
          itemId,
        );
        if (resolved.typeCode !== QR_TYPE_LOCATION || !resolved.locationUnit) {
          const place = locationLabel?.trim();
          throw new Error(
            place
              ? `That QR is not a location label. Return this item to ${place}.`
              : 'That QR is not a location label. Scan a warehouse location QR.',
          );
        }
        const order = await returnOrderLine(
          orderId,
          itemId,
          qty,
          resolved.locationUnit.id,
        );
        toast.success(`Returned ${qty}.`);
        onDoneRef.current(order);
      } catch (cause) {
        const message = apiErrorMessage(cause);
        setError(message);
        toast.error(message);
        handled.current = null;
        scan.scanAgain();
      } finally {
        bindingRef.current = false;
        setBinding(false);
      }
    },
    [itemId, locationLabel, orderId, qty, scan.scanAgain, toast],
  );

  useEffect(() => {
    const data = scan.result?.data?.trim();
    if (!data || bindingRef.current) return;
    if (handled.current === data) return;
    handled.current = data;
    void resolveFromPayload(data);
  }, [resolveFromPayload, scan.result]);

  return {
    ...scan,
    binding,
    error,
  };
}

export type UseOrderScanLocationResult = ReturnType<typeof useOrderScanLocation>;
