import { useCallback, useState } from 'react';
import { Share } from 'react-native';
import { apiErrorMessage } from '@/api/client';
import {
  createLocationQr,
  fetchLocationUnit,
  locationQrPayload,
  type LocationUnit,
} from '@/api/warehouse';
import { usePrint } from '@/features/print/hook/usePrint';

type Args = {
  warehouseId: string;
  locationUnitId: string;
};

async function resolveQr(
  warehouseId: string,
  locationUnitId: string,
  unit: LocationUnit,
): Promise<{ unit: LocationUnit; payload: string }> {
  const existing = locationQrPayload(unit);
  if (existing) {
    return { unit, payload: existing };
  }

  try {
    const created = await createLocationQr(warehouseId, { locationUnitId });
    return {
      unit: created.locationUnit,
      payload: created.qrCode.payload,
    };
  } catch (cause) {
    const detail = await fetchLocationUnit(warehouseId, locationUnitId);
    const reused =
      locationQrPayload(detail.locationUnit) ??
      detail.qrCode?.payload?.trim() ??
      null;
    if (reused) {
      return { unit: detail.locationUnit, payload: reused };
    }
    throw cause;
  }
}

export function usePrintLocationLabel({ warehouseId, locationUnitId }: Args) {
  const print = usePrint();
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
      const unitWithQr =
        detail.locationUnit.qrCode || !detail.qrCode
          ? detail.locationUnit
          : { ...detail.locationUnit, qrCode: detail.qrCode };
      const resolved = await resolveQr(
        warehouseId,
        locationUnitId,
        unitWithQr,
      );
      setUnit(resolved.unit);
      setQrPayload(resolved.payload);
    } catch (cause) {
      setUnit(null);
      setQrPayload(null);
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [locationUnitId, warehouseId]);

  const ensureQr = useCallback(async () => {
    setEnsuring(true);
    setError(null);
    try {
      const current =
        unit ??
        (await fetchLocationUnit(warehouseId, locationUnitId)).locationUnit;
      const resolved = await resolveQr(warehouseId, locationUnitId, current);
      setUnit(resolved.unit);
      setQrPayload(resolved.payload);
      return resolved.payload;
    } catch (cause) {
      setError(apiErrorMessage(cause));
      return null;
    } finally {
      setEnsuring(false);
    }
  }, [locationUnitId, unit, warehouseId]);

  const shareLabel = async () => {
    const payload = qrPayload ?? (await ensureQr());
    if (!payload || !unit) return;

    setSharing(true);
    try {
      const subtitle = unit.label ? ` (${unit.label})` : '';
      await Share.share({
        title: unit.name,
        message: `${unit.name}${subtitle}\n${payload}`,
      });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSharing(false);
    }
  };

  const printLabel = async () => {
    const payload = qrPayload ?? (await ensureQr());
    if (!payload) return;
    await print.printQrPayload(payload, unit?.label ?? undefined);
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
