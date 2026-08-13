import { useCallback, useState } from 'react';
import { Share } from 'react-native';
import { apiErrorMessage } from '@/api/client';
import {
  ensureLocationQrPayload,
  fetchLocationUnit,
  locationLabelText,
  locationQrPayload,
  type EnsuredLocationQr,
  type LocationUnit,
} from '@/api/warehouse';
import { useAppToast } from '@/components/ui/toast';
import { usePrinter } from '@/features/print/PrinterProvider';

type Args = {
  warehouseId: string;
  locationUnitId: string;
};

function unitWithQr(
  unit: LocationUnit,
  qrCode: LocationUnit['qrCode'],
): LocationUnit {
  if (unit.qrCode || !qrCode) {
    return unit;
  }
  return { ...unit, qrCode };
}

export function usePrintLocationLabel({ warehouseId, locationUnitId }: Args) {
  const print = usePrinter();
  const toast = useAppToast();
  const [unit, setUnit] = useState<LocationUnit | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ensuring, setEnsuring] = useState(false);
  const [sharing, setSharing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchLocationUnit(warehouseId, locationUnitId);
      const nextUnit = unitWithQr(detail.locationUnit, detail.qrCode);
      setUnit(nextUnit);
      setQrPayload(locationQrPayload(nextUnit));
    } catch (cause) {
      setUnit(null);
      setQrPayload(null);
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [locationUnitId, warehouseId]);

  const resolveQr = useCallback(async (): Promise<EnsuredLocationQr | null> => {
    setEnsuring(true);
    try {
      let current = unit;
      if (!current) {
        const detail = await fetchLocationUnit(warehouseId, locationUnitId);
        current = unitWithQr(detail.locationUnit, detail.qrCode);
      }
      const resolved = await ensureLocationQrPayload(warehouseId, current);
      setUnit(resolved.unit);
      setQrPayload(resolved.payload);
      return resolved;
    } catch (cause) {
      toast.error(apiErrorMessage(cause));
      return null;
    } finally {
      setEnsuring(false);
    }
  }, [locationUnitId, toast, unit, warehouseId]);

  const ensureQr = async () => {
    const resolved = await resolveQr();
    return resolved?.payload ?? null;
  };

  const shareLabel = async () => {
    const resolved = qrPayload && unit
      ? { payload: qrPayload, unit }
      : await resolveQr();
    if (!resolved) return;

    setSharing(true);
    try {
      const subtitle = resolved.unit.label ? ` (${resolved.unit.label})` : '';
      await Share.share({
        title: resolved.unit.name,
        message: `${resolved.unit.name}${subtitle}\n${resolved.payload}`,
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
      await print.printQrPayload(
        resolved.payload,
        locationLabelText(resolved.unit),
      );
      toast.success('Printed location label.');
    } catch {
      // usePrint already toasted the printer error
    }
  };

  return {
    unit,
    qrPayload,
    error,
    loading,
    ensuring,
    sharing,
    printerBusy: print.busy,
    printerMessage: print.message,
    deviceName: print.deviceName,
    printerSummary: print.printerSummary,
    load,
    ensureQr,
    shareLabel,
    connectPrinter: print.connect,
    printLabel,
  };
}

export type UsePrintLocationLabelResult = ReturnType<typeof usePrintLocationLabel>;
