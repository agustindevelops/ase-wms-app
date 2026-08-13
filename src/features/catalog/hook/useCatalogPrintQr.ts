import { useCallback, useState } from 'react';
import { Share } from 'react-native';
import { apiErrorMessage } from '@/api/client';
import {
  createItemQr,
  deleteItemQr,
  ensureItemQrPayload,
  itemQrPayload,
  type CatalogItem,
  type CatalogQrCode,
} from '@/api/catalog';
import { useAppToast } from '@/components/ui/toast';
import { usePrinter } from '@/features/print/PrinterProvider';

type Args = {
  warehouseId: string;
  itemId: string;
  itemName: string;
  initialQrCodeId?: string | null;
};

export function useCatalogPrintQr({
  warehouseId,
  itemId,
  itemName,
  initialQrCodeId,
}: Args) {
  const print = usePrinter();
  const toast = useAppToast();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(
    initialQrCodeId ?? null,
  );
  const [qrCode, setQrCode] = useState<CatalogQrCode | null>(null);
  const [ensuring, setEnsuring] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seedItem = useCallback((): CatalogItem => {
    if (item) return item;
    return {
      id: itemId,
      warehouseId,
      name: itemName,
      quantityOwned: 0,
      quantityAvailable: 0,
      categoryId: null,
      locationUnitId: null,
      qrCodeId: initialQrCodeId ?? null,
      createdAt: '',
      updatedAt: '',
      category: null,
      qrCode: null,
      locationUnit: null,
      files: [],
    };
  }, [initialQrCodeId, item, itemId, itemName, warehouseId]);

  const resolveQr = useCallback(async () => {
    setEnsuring(true);
    setError(null);
    try {
      const resolved = await ensureItemQrPayload(warehouseId, seedItem());
      setItem(resolved.item);
      setQrPayload(resolved.payload);
      setQrCode(resolved.qrCode);
      return resolved;
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setEnsuring(false);
    }
  }, [seedItem, toast, warehouseId]);

  const ensureQr = async () => {
    const resolved = await resolveQr();
    return resolved?.payload ?? null;
  };

  const replaceQr = async () => {
    setReplacing(true);
    setError(null);
    try {
      const current = seedItem();
      const existingId = current.qrCodeId ?? qrCode?.id;
      if (existingId) {
        await deleteItemQr(warehouseId, existingId);
      }

      const created = await createItemQr({ warehouseId, itemId });
      const payload =
        created.qrCode.payload?.trim() || created.qrCode.id.trim();
      setItem(created.item);
      setQrCode(created.qrCode);
      setQrPayload(payload);
      toast.success('Item QR replaced.');
      return payload;
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setReplacing(false);
    }
  };

  const shareLabel = async () => {
    const resolved = qrPayload
      ? { payload: qrPayload }
      : await resolveQr();
    if (!resolved) return;

    setSharing(true);
    try {
      await Share.share({
        title: itemName,
        message: `${itemName}\n${resolved.payload}`,
      });
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
    } finally {
      setSharing(false);
    }
  };

  const printLabel = async () => {
    if (!print.deviceName) {
      toast.error('Connect a D110 printer first.');
      return;
    }

    const resolved = await resolveQr();
    if (!resolved) return;

    try {
      await print.printQrPayload(resolved.payload, itemName);
      toast.success('Printed item label.');
    } catch {
      // usePrint already toasted
    }
  };

  return {
    itemName,
    qrPayload: qrPayload ?? itemQrPayload(seedItem()),
    error,
    ensuring,
    replacing,
    sharing,
    printerBusy: print.busy,
    printerMessage: print.message,
    deviceName: print.deviceName,
    printerSummary: print.printerSummary,
    ensureQr,
    replaceQr,
    shareLabel,
    connectPrinter: print.connect,
    printLabel,
  };
}

export type UseCatalogPrintQrResult = ReturnType<typeof useCatalogPrintQr>;
