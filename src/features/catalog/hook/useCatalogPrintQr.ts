import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { apiErrorMessage } from '@/api/client';
import {
  createItemQr,
  deleteItemQr,
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
  const [printed, setPrinted] = useState(false);
  const [showPrinterSetup, setShowPrinterSetup] = useState(
    () => !print.deviceName,
  );
  const [ensuring, setEnsuring] = useState(false);
  const [replacing, setReplacing] = useState(false);
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

  const createQrForPrint = useCallback(async () => {
    const existing = qrPayload ?? itemQrPayload(seedItem());
    if (existing) {
      return { payload: existing, created: false as const };
    }

    setEnsuring(true);
    setError(null);
    try {
      const created = await createItemQr(itemId);
      const payload =
        created.qrCode.payload?.trim() || created.qrCode.id.trim();
      if (!payload) {
        throw new Error('QR code was created without a printable payload.');
      }
      setItem(created.item);
      setQrCode(created.qrCode);
      setQrPayload(payload);
      return { payload, created: true as const };
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setEnsuring(false);
    }
  }, [itemId, qrPayload, seedItem, toast]);

  const rollbackCreatedQr = useCallback(async () => {
    try {
      await deleteItemQr(itemId);
    } catch (cause) {
      console.warn('Failed to roll back item QR after print error:', cause);
    }
    setQrPayload(null);
    setQrCode(null);
  }, [itemId]);

  const runReplaceQr = useCallback(async () => {
    setReplacing(true);
    setError(null);
    try {
      await deleteItemQr(itemId);
      const created = await createItemQr(itemId);
      const payload =
        created.qrCode.payload?.trim() || created.qrCode.id.trim();
      if (!payload) {
        throw new Error('QR code was created without a printable payload.');
      }
      setItem(created.item);
      setQrCode(created.qrCode);
      setQrPayload(payload);
      setPrinted(false);
      toast.success('Replaced QR code. Print a new label.');
    } catch (cause) {
      const message = apiErrorMessage(cause);
      setError(message);
      toast.error(message);
    } finally {
      setReplacing(false);
    }
  }, [itemId, toast]);

  const replaceQr = useCallback(() => {
    Alert.alert(
      'Replace QR code?',
      'The current label will stop working. Print a new label after replacing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace',
          style: 'destructive',
          onPress: () => {
            void runReplaceQr();
          },
        },
      ],
    );
  }, [runReplaceQr]);

  const printLabel = async (): Promise<boolean> => {
    if (!print.deviceName) {
      setShowPrinterSetup(true);
      const connected = await print.connect();
      if (!connected) {
        return false;
      }
    }

    const resolved = await createQrForPrint();
    if (!resolved) return false;

    try {
      await print.printQrPayload(resolved.payload, itemName);
      setPrinted(true);
      toast.success('Printed item label.');
      return true;
    } catch {
      if (resolved.created) {
        await rollbackCreatedQr();
      }
      return false;
    }
  };

  return {
    itemName,
    qrPayload: qrPayload ?? itemQrPayload(seedItem()),
    qrCode,
    error,
    printed,
    ensuring,
    replacing,
    showPrinterSetup,
    printerBusy: print.busy,
    printerMessage: print.message,
    deviceName: print.deviceName,
    printerSummary: print.printerSummary,
    printerSignal: print.signal,
    connectPrinter: print.connect,
    printLabel,
    replaceQr,
  };
}

export type UseCatalogPrintQrResult = ReturnType<typeof useCatalogPrintQr>;
