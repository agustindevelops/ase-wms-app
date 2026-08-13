import { api } from './client';

/**
 * ASE-21 / ERD data contract for warehouse hierarchy.
 *
 * Prisma JSON dates arrive as ISO strings. Nested relations match
 * locationUnitInclude: `type` and `qrCode` (not `locationUnitType`).
 *
 * GET    /api/warehouse/{warehouseId}
 * PUT    /api/warehouse/{warehouseId}
 * GET    /api/warehouse/{warehouseId}/location-unit/{id}
 * POST   /api/warehouse/{warehouseId}/location-unit
 * PUT    /api/warehouse/{warehouseId}/location-unit/{id}
 * DELETE /api/warehouse/{warehouseId}/location-unit/{id}
 * POST   /api/warehouse/{warehouseId}/QR
 * DELETE /api/warehouse/{warehouseId}/QR/{id}
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
};

export type CreateQrResponse = {
  qrCode: QrCode;
  locationUnit: LocationUnit;
};

export type DeleteAck = {
  id: string;
  deleted: true;
};

/** GET /api/warehouse/{warehouseId} */
export async function fetchWarehouseRoot(
  warehouseId: string,
): Promise<WarehouseRootResponse> {
  const { data } = await api.get<WarehouseRootResponse>(
    `/api/warehouse/${warehouseId}`,
  );
  return data;
}

/** PUT /api/warehouse/{warehouseId} */
export async function updateWarehouse(
  warehouseId: string,
  body: WarehouseWriteBody,
): Promise<Warehouse> {
  const { data } = await api.put<WarehouseMutationResponse>(
    `/api/warehouse/${warehouseId}`,
    body,
  );
  return data.warehouse;
}

/** GET /api/warehouse/{warehouseId}/location-unit/{id} */
export async function fetchLocationUnit(
  warehouseId: string,
  locationUnitId: string,
): Promise<LocationUnitDetailResponse> {
  const { data } = await api.get<LocationUnitDetailResponse>(
    `/api/warehouse/${warehouseId}/location-unit/${locationUnitId}`,
  );
  return data;
}

/** POST /api/warehouse/{warehouseId}/location-unit */
export async function createLocationUnit(
  warehouseId: string,
  body: LocationUnitWriteBody,
): Promise<LocationUnit> {
  const { data } = await api.post<LocationUnitMutationResponse>(
    `/api/warehouse/${warehouseId}/location-unit`,
    body,
  );
  return data.locationUnit;
}

/** PUT /api/warehouse/{warehouseId}/location-unit/{id} */
export async function updateLocationUnit(
  warehouseId: string,
  locationUnitId: string,
  body: LocationUnitWriteBody,
): Promise<LocationUnit> {
  const { data } = await api.put<LocationUnitMutationResponse>(
    `/api/warehouse/${warehouseId}/location-unit/${locationUnitId}`,
    body,
  );
  return data.locationUnit;
}

/** DELETE /api/warehouse/{warehouseId}/location-unit/{id} */
export async function deleteLocationUnit(
  warehouseId: string,
  locationUnitId: string,
): Promise<DeleteAck> {
  const { data } = await api.delete<DeleteAck>(
    `/api/warehouse/${warehouseId}/location-unit/${locationUnitId}`,
  );
  return data;
}

/** POST /api/warehouse/{warehouseId}/QR */
export async function createLocationQr(
  warehouseId: string,
  body: CreateQrBody,
): Promise<CreateQrResponse> {
  const { data } = await api.post<CreateQrResponse>(
    `/api/warehouse/${warehouseId}/QR`,
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

/**
 * Print payload for a location unit. Uses the included QR when present;
 * POST /QR only if this unit has none yet.
 */
export async function ensureLocationQrPayload(
  warehouseId: string,
  unit: LocationUnit,
): Promise<string> {
  const existing = locationQrPayload(unit);
  if (existing) {
    return existing;
  }

  const created = await createLocationQr(warehouseId, {
    locationUnitId: unit.id,
  });
  return created.qrCode.payload || created.qrCode.id;
}

export function locationUnitSubtitle(unit: LocationUnit): string {
  return [unit.label, unit.type.name].filter(Boolean).join(' · ');
}
