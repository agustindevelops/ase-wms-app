import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  bindItemToLocation,
  resolveWarehouseQr,
} from '@/api/catalog';
import { useAppToast } from '@/components/ui/toast';
import { useScan } from '@/features/scan/hook/useScan';

/** QR_CODE_TYPE.code for warehouse location units. */
const QR_TYPE_LOCATION = 1;

type Args = {
  warehouseId: string;
  itemId: string;
  onBound: () => void;
};

export function useCatalogScanLocation({
  warehouseId,
  itemId,
  onBound,
}: Args) {
  const scan = useScan('qr');
  const toast = useAppToast();
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bindingRef = useRef(false);
  const handled = useRef<string | null>(null);
  const onBoundRef = useRef(onBound);
  onBoundRef.current = onBound;

  const bindFromPayload = useCallback(
    async (payload: string) => {
      if (bindingRef.current) return;
      bindingRef.current = true;
      setBinding(true);
      setError(null);
      try {
        const resolved = await resolveWarehouseQr(warehouseId, payload);

        if (resolved.typeCode !== QR_TYPE_LOCATION || !resolved.locationUnit) {
          throw new Error(
            'That QR is not a warehouse location. Scan a location label.',
          );
        }

        await bindItemToLocation(
          warehouseId,
          resolved.locationUnit.id,
          itemId,
        );
        toast.success(
          `Stored at ${resolved.locationUnit.label || resolved.locationUnit.name}.`,
        );
        onBoundRef.current();
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
    [itemId, scan.scanAgain, toast, warehouseId],
  );

  useEffect(() => {
    const data = scan.result?.data?.trim();
    if (!data || bindingRef.current) return;
    if (handled.current === data) return;
    handled.current = data;
    void bindFromPayload(data);
  }, [bindFromPayload, scan.result]);

  return {
    ...scan,
    binding,
    error,
  };
}

export type UseCatalogScanLocationResult = ReturnType<
  typeof useCatalogScanLocation
>;
