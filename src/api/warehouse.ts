import { api, isApiConflict } from './client';

/**
 * ASE-21 / ERD data contract for warehouse hierarchy.
 *
 * Prisma JSON dates arrive as ISO strings. Nested relations match
 * locationUnitInclude: `type` and `qrCode` (not `locationUnitType`).
 *
 * GET    /warehouse/{warehouseId}
 * PUT    /warehouse/{warehouseId}
 * GET    /warehouse/{warehouseId}/location-unit/{id}
 * POST   /warehouse/{warehouseId}/location-unit
 * PUT    /warehouse/{warehouseId}/location-unit/{id}
 * DELETE /warehouse/{warehouseId}/location-unit/{id}
 * POST   /warehouse/{warehouseId}/QR  (optional payload = scanned label)
 * DELETE /warehouse/{warehouseId}/QR/{id}
 */

export type WarehouseAddress = {
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
};

export type LocationUnitType = {
  id: string;
  code: string;
  name: string;
};

export type QrCode = {
  id: string;
  payload: string;
  typeId: string;
  createdAt: string;
  updatedAt?: string;
};

/** LOCATION_UNIT row with type + optional QR, as returned by ASE-21. */
export type LocationUnit = {
  id: string;
  warehouseId: string;
  parentLocationUnitId: string | null;
  locationUnitTypeId: string;
  name: string;
  label: string | null;
  qrCodeId: string | null;
  createdAt: string;
  updatedAt: string;
  type: LocationUnitType;
  qrCode: QrCode | null;
};

export type Warehouse = {
  id: string;
  name: string;
  address: WarehouseAddress;
};

export type WarehouseRootResponse = {
  warehouse: Warehouse;
  locationUnits: LocationUnit[];
  locationUnitTypes: LocationUnitType[];
};

export type WarehouseWriteBody = {
  name: string;
};

export type WarehouseMutationResponse = {
  warehouse: Warehouse;
};

export type LocationUnitDetailResponse = {
  locationUnit: LocationUnit;
  children: LocationUnit[];
  qrCode: QrCode | null;
};

export type LocationUnitWriteBody = {
  name: string;
  label?: string | null;
  parentLocationUnitId?: string | null;
};

export type LocationUnitMutationResponse = {
  locationUnit: LocationUnit;
};

export type CreateQrBody = {
  locationUnitId: string;
  /** Scanned label value. Omit to generate a printable QR (payload = id). */
  payload?: string;
};

export type CreateQrResponse = {
  qrCode: QrCode;
  locationUnit: LocationUnit;
};

export type DeleteAck = {
  id: string;
  deleted: true;
};

/** GET /warehouse/{warehouseId} */
export async function fetchWarehouseRoot(
  warehouseId: string,
): Promise<WarehouseRootResponse> {
  const { data } = await api.get<WarehouseRootResponse>(
    `/warehouse/${warehouseId}`,
  );
  return data;
}

/** PUT /warehouse/{warehouseId} */
export async function updateWarehouse(
  warehouseId: string,
  body: WarehouseWriteBody,
): Promise<Warehouse> {
  const { data } = await api.put<WarehouseMutationResponse>(
    `/warehouse/${warehouseId}`,
    body,
  );
  return data.warehouse;
}

/** GET /warehouse/{warehouseId}/location-unit/{id} */
export async function fetchLocationUnit(
  warehouseId: string,
  locationUnitId: string,
): Promise<LocationUnitDetailResponse> {
  const { data } = await api.get<LocationUnitDetailResponse>(
    `/warehouse/${warehouseId}/location-unit/${locationUnitId}`,
  );
  return data;
}

/** POST /warehouse/{warehouseId}/location-unit */
export async function createLocationUnit(
  warehouseId: string,
  body: LocationUnitWriteBody,
): Promise<LocationUnit> {
  const { data } = await api.post<LocationUnitMutationResponse>(
    `/warehouse/${warehouseId}/location-unit`,
    body,
  );
  return data.locationUnit;
}

/** PUT /warehouse/{warehouseId}/location-unit/{id} */
export async function updateLocationUnit(
  warehouseId: string,
  locationUnitId: string,
  body: LocationUnitWriteBody,
): Promise<LocationUnit> {
  const { data } = await api.put<LocationUnitMutationResponse>(
    `/warehouse/${warehouseId}/location-unit/${locationUnitId}`,
    body,
  );
  return data.locationUnit;
}

/** DELETE /warehouse/{warehouseId}/location-unit/{id} */
export async function deleteLocationUnit(
  warehouseId: string,
  locationUnitId: string,
): Promise<DeleteAck> {
  const { data } = await api.delete<DeleteAck>(
    `/warehouse/${warehouseId}/location-unit/${locationUnitId}`,
  );
  return data;
}

/** POST /warehouse/{warehouseId}/QR */
export async function createLocationQr(
  warehouseId: string,
  body: CreateQrBody,
): Promise<CreateQrResponse> {
  const { data } = await api.post<CreateQrResponse>(
    `/warehouse/${warehouseId}/QR`,
    body,
  );
  return data;
}

export function formatWarehouseAddress(
  address: WarehouseAddress | null | undefined,
): string | null {
  if (!address) return null;

  const cityLine = [address.city, address.state, address.zipcode]
    .filter((part) => part && part.trim().length > 0)
    .join(' ');

  const lines = [address.addressLine1, address.addressLine2, cityLine]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return lines.length > 0 ? lines.join('\n') : null;
}

export function locationQrPayload(unit: LocationUnit): string | null {
  const fromRelation = unit.qrCode?.payload?.trim() || unit.qrCode?.id?.trim();
  if (fromRelation) {
    return fromRelation;
  }
  return unit.qrCodeId?.trim() || null;
}

export function hasLocationQr(unit: LocationUnit): boolean {
  return locationQrPayload(unit) !== null;
}

export type EnsuredLocationQr = {
  payload: string;
  unit: LocationUnit;
};

function payloadFromQr(qr: QrCode | null | undefined): string | null {
  const value = qr?.payload?.trim() || qr?.id?.trim();
  return value || null;
}

/**
 * Location-label payload (QR_CODE_TYPE=1). Reuses the existing QR when present;
 * otherwise POST /QR and wait for success. A 409 means another request already
 * attached one — refetch and print that same code.
 */
export async function ensureLocationQrPayload(
  warehouseId: string,
  unit: LocationUnit,
): Promise<EnsuredLocationQr> {
  const existing = locationQrPayload(unit);
  if (existing) {
    return { payload: existing, unit };
  }

  try {
    const created = await createLocationQr(warehouseId, {
      locationUnitId: unit.id,
    });
    const payload = payloadFromQr(created.qrCode);
    if (!payload) {
      throw new Error('QR code was created without a printable payload.');
    }
    return { payload, unit: created.locationUnit };
  } catch (cause) {
    if (!isApiConflict(cause)) {
      throw cause;
    }

    const detail = await fetchLocationUnit(warehouseId, unit.id);
    const reused =
      locationQrPayload(detail.locationUnit) ?? payloadFromQr(detail.qrCode);
    if (!reused) {
      throw cause;
    }
    return { payload: reused, unit: detail.locationUnit };
  }
}

export function locationUnitSubtitle(unit: LocationUnit): string {
  return [unit.label, unit.type.name].filter(Boolean).join(' · ');
}

/** Human-readable text printed beside the QR; the QR itself carries the id. */
export function locationLabelText(unit: LocationUnit): string {
  return unit.label?.trim() || unit.name.trim();
}
