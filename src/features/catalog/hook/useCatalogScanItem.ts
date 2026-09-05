import { useCallback, useEffect, useRef, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import { resolveWarehouseQr, type ResolveQrResponse } from '@/api/catalog';
import { useAppToast } from '@/components/ui/toast';
import { useScan } from '@/features/scan/hook/useScan';

/** QR_CODE_TYPE.code for items. */
const QR_TYPE_ITEM = 0;

export type CatalogScanItemMode = 'move' | 'remove' | 'edit';

type Args = {
  warehouseId: string;
  mode: CatalogScanItemMode;
  onItem: (item: NonNullable<ResolveQrResponse['item']>) => void;
};

export function useCatalogScanItem({ warehouseId, mode, onItem }: Args) {
  const scan = useScan('qr');
  const toast = useAppToast();
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvingRef = useRef(false);
  const handled = useRef<string | null>(null);
  const onItemRef = useRef(onItem);
  onItemRef.current = onItem;

  const resolveFromPayload = useCallback(
    async (payload: string) => {
      if (resolvingRef.current) return;
      resolvingRef.current = true;
      setResolving(true);
      setError(null);
      try {
        const resolved = await resolveWarehouseQr(warehouseId, payload);
        if (resolved.typeCode !== QR_TYPE_ITEM || !resolved.item) {
          throw new Error('That QR is not an item label. Scan an item QR.');
        }

        const located = Boolean(resolved.item.locationUnitId);
        if (mode !== 'edit' && !located) {
          throw new Error(
            mode === 'move'
              ? 'This item has no location yet. Use Add item to warehouse.'
              : 'This item is not attached to a location.',
          );
        }

        onItemRef.current(resolved.item);
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
    [mode, scan.scanAgain, toast, warehouseId],
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

export type UseCatalogScanItemResult = ReturnType<typeof useCatalogScanItem>;
