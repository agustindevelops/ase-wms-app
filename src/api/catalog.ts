import { api, isApiConflict } from './client';

/**
 * ASE-3 catalog data contract.
 *
 * GET    /api/lookup/item-categories
 * GET    /api/lookup/materials
 * POST   /api/item/catalog
 * POST   /api/item/catalog/QR
 * DELETE /api/item/catalog/QR/{qrId}?warehouseId=
 * GET    /api/warehouse/{warehouseId}/QR/{id}
 * PUT    /api/warehouse/{warehouseId}/location-unit/{id}/item/{itemId}
 * GET    /api/warehouse/{warehouseId}/item?location=none|set
 * DELETE /api/warehouse/{warehouseId}/item/{itemId}/location
 */

export type ItemCategory = {
  id: string;
  code: string;
  name: string;
};

export type ItemMaterialOption = {
  code: string;
  name: string;
};

export type CatalogQrCode = {
  id: string;
  payload: string;
  typeId: string;
  createdAt: string;
  updatedAt?: string;
};

export type CatalogItem = {
  id: string;
  warehouseId: string;
  name: string;
  quantityOwned: number;
  quantityAvailable: number;
  categoryId: string | null;
  locationUnitId: string | null;
  qrCodeId: string | null;
  createdAt: string;
  updatedAt: string;
  category: ItemCategory | null;
  qrCode: CatalogQrCode | null;
  locationUnit: {
    id: string;
    name: string;
    label: string | null;
    warehouseId: string;
    qrCodeId: string | null;
  } | null;
  files: Array<{
    id: string;
    publicUrl: string | null;
    status: string;
    sortOrder: number;
    contentType: string;
  }>;
};

export type CreateCatalogItemBody = {
  warehouseId: string;
  name: string;
  quantity: number;
  photoFileIds: string[];
  categoryId?: string | null;
  material?: string | null;
};

export type CreateItemQrBody = {
  warehouseId: string;
  itemId: string;
};

export type ResolveQrResponse = {
  qrCode: CatalogQrCode;
  typeCode: number;
  locationUnit: {
    id: string;
    warehouseId: string;
    name: string;
    label: string | null;
    qrCodeId: string | null;
  } | null;
  item: {
    id: string;
    warehouseId: string;
    name: string;
    qrCodeId: string | null;
    locationUnitId?: string | null;
    locationUnit?: {
      id: string;
      name: string;
      label: string | null;
    } | null;
  } | null;
};

export type DeleteAck = {
  id: string;
  deleted: true;
};

/** GET /api/lookup/item-categories */
export async function fetchItemCategories(): Promise<ItemCategory[]> {
  const { data } = await api.get<{ categories: ItemCategory[] }>(
    '/api/lookup/item-categories',
  );
  return data.categories;
}

/** GET /api/lookup/materials */
export async function fetchItemMaterials(): Promise<ItemMaterialOption[]> {
  const { data } = await api.get<{ materials: ItemMaterialOption[] }>(
    '/api/lookup/materials',
  );
  return data.materials;
}

/** POST /api/item/catalog */
export async function createCatalogItem(
  body: CreateCatalogItemBody,
): Promise<CatalogItem> {
  const { data } = await api.post<{ item: CatalogItem }>(
    '/api/item/catalog',
    body,
  );
  return data.item;
}

/** POST /api/item/catalog/QR */
export async function createItemQr(
  body: CreateItemQrBody,
): Promise<{ qrCode: CatalogQrCode; item: CatalogItem }> {
  const { data } = await api.post<{ qrCode: CatalogQrCode; item: CatalogItem }>(
    '/api/item/catalog/QR',
    body,
  );
  return data;
}

/** DELETE /api/item/catalog/QR/{qrId}?warehouseId= */
export async function deleteItemQr(
  warehouseId: string,
  qrId: string,
): Promise<DeleteAck> {
  const { data } = await api.delete<DeleteAck>(
    `/api/item/catalog/QR/${qrId}`,
    { params: { warehouseId } },
  );
  return data;
}

/** GET /api/warehouse/{warehouseId}/QR/{id} — id or payload. */
export async function resolveWarehouseQr(
  warehouseId: string,
  idOrPayload: string,
): Promise<ResolveQrResponse> {
  const { data } = await api.get<ResolveQrResponse>(
    `/api/warehouse/${warehouseId}/QR/${encodeURIComponent(idOrPayload)}`,
  );
  return data;
}

/** PUT /api/warehouse/{warehouseId}/location-unit/{locationUnitId}/item/{itemId} */
export async function bindItemToLocation(
  warehouseId: string,
  locationUnitId: string,
  itemId: string,
): Promise<CatalogItem> {
  const { data } = await api.put<{ item: CatalogItem }>(
    `/api/warehouse/${warehouseId}/location-unit/${locationUnitId}/item/${itemId}`,
  );
  return data.item;
}

export type WarehouseItemLocationFilter = 'none' | 'set';

/** GET /api/warehouse/{warehouseId}/item?location=none|set */
export async function fetchWarehouseItems(
  warehouseId: string,
  location: WarehouseItemLocationFilter,
): Promise<CatalogItem[]> {
  const { data } = await api.get<{ items: CatalogItem[] }>(
    `/api/warehouse/${warehouseId}/item`,
    { params: { location } },
  );
  return data.items;
}

/** DELETE /api/warehouse/{warehouseId}/item/{itemId}/location */
export async function unbindItemLocation(
  warehouseId: string,
  itemId: string,
): Promise<CatalogItem> {
  const { data } = await api.delete<{ item: CatalogItem }>(
    `/api/warehouse/${warehouseId}/item/${itemId}/location`,
  );
  return data.item;
}

export function itemQrPayload(item: CatalogItem): string | null {
  const fromRelation =
    item.qrCode?.payload?.trim() || item.qrCode?.id?.trim();
  if (fromRelation) {
    return fromRelation;
  }
  return item.qrCodeId?.trim() || null;
}

function payloadFromQr(qr: CatalogQrCode | null | undefined): string | null {
  const value = qr?.payload?.trim() || qr?.id?.trim();
  return value || null;
}

/**
 * Item-label payload (QR_CODE_TYPE=0). Reuses existing QR; otherwise POST.
 * On 409, treat as already created and use the returned/attached code.
 */
export async function ensureItemQrPayload(
  warehouseId: string,
  item: CatalogItem,
): Promise<{ payload: string; item: CatalogItem; qrCode: CatalogQrCode | null }> {
  const existing = itemQrPayload(item);
  if (existing) {
    return { payload: existing, item, qrCode: item.qrCode };
  }

  try {
    const created = await createItemQr({ warehouseId, itemId: item.id });
    const payload = payloadFromQr(created.qrCode);
    if (!payload) {
      throw new Error('QR code was created without a printable payload.');
    }
    return { payload, item: created.item, qrCode: created.qrCode };
  } catch (cause) {
    if (!isApiConflict(cause)) {
      throw cause;
    }
    // Another request attached one — re-create path isn't available; surface conflict.
    throw cause;
  }
}
