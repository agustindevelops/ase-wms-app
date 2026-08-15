import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { createLocationQr } from '@/api/warehouse';
import { useAppToast } from '@/components/ui/toast';
import { useScan } from '@/features/scan/hook/useScan';

type Args = {
  warehouseId: string;
  locationUnitId: string;
  onLinked: () => void;
};

export function useLinkLocationQr({
  warehouseId,
  locationUnitId,
  onLinked,
}: Args) {
  const scan = useScan('qr');
  const toast = useAppToast();
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bindingRef = useRef(false);
  const handled = useRef<string | null>(null);
  const onLinkedRef = useRef(onLinked);
  onLinkedRef.current = onLinked;

  const linkFromPayload = useCallback(
    async (payload: string) => {
      if (bindingRef.current) return;
      bindingRef.current = true;
      setBinding(true);
      setError(null);
      try {
        await createLocationQr(warehouseId, {
          locationUnitId,
          payload,
        });
        toast.success('Linked existing QR to this location.');
        onLinkedRef.current();
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
    [locationUnitId, scan.scanAgain, toast, warehouseId],
  );

  useEffect(() => {
    const data = scan.result?.data?.trim();
    if (!data || bindingRef.current) return;
    if (handled.current === data) return;
    handled.current = data;
    void linkFromPayload(data);
  }, [linkFromPayload, scan.result]);

  return {
    ...scan,
    binding,
    error,
  };
}

export type UseLinkLocationQrResult = ReturnType<typeof useLinkLocationQr>;
