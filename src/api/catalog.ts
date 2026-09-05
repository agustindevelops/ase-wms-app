import { api, isApiConflict } from './client';

/**
 * ASE-3 catalog data contract.
 *
 * GET    /lookup/item-categories
 * GET    /lookup/materials
 * POST   /item
 * POST   /item/{itemId}/qr
 * DELETE /item/{itemId}/qr
 * GET    /warehouse/{warehouseId}/QR/{id}
 * PUT    /warehouse/{warehouseId}/location-unit/{id}/item/{itemId}
 * GET    /item/{itemId}
 * GET    /warehouse/{warehouseId}/item?location=none|set|all&q=
 * DELETE /warehouse/{warehouseId}/item/{itemId}/location
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
  material?: string | null;
  locationUnitId: string | null;
  qrCodeId: string | null;
  disposition?: string | null;
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
    readUrl?: string | null;
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

export type UpdateCatalogItemBody = {
  name?: string;
  quantity?: number;
  photoFileIds?: string[];
  categoryId?: string | null;
  material?: string | null;
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

/** GET /lookup/item-categories */
export async function fetchItemCategories(): Promise<ItemCategory[]> {
  const { data } = await api.get<{ categories: ItemCategory[] }>(
    '/lookup/item-categories',
  );
  return data.categories;
}

/** GET /lookup/materials */
export async function fetchItemMaterials(): Promise<ItemMaterialOption[]> {
  const { data } = await api.get<{ materials: ItemMaterialOption[] }>(
    '/lookup/materials',
  );
  return data.materials;
}

/** POST /item */
export async function createCatalogItem(
  body: CreateCatalogItemBody,
): Promise<CatalogItem> {
  const { data } = await api.post<{ item: CatalogItem }>(
    '/item',
    body,
  );
  return data.item;
}

/** PATCH /item/{itemId} */
export async function updateCatalogItem(
  itemId: string,
  body: UpdateCatalogItemBody,
): Promise<CatalogItem> {
  const { data } = await api.patch<{ item: CatalogItem }>(
    `/item/${itemId}`,
    body,
  );
  return data.item;
}

/** POST /item/{itemId}/qr */
export async function createItemQr(
  itemId: string,
): Promise<{ qrCode: CatalogQrCode; item: CatalogItem }> {
  const { data } = await api.post<{ qrCode: CatalogQrCode; item: CatalogItem }>(
    `/item/${itemId}/qr`,
  );
  return data;
}

/** DELETE /item/{itemId}/qr */
export async function deleteItemQr(itemId: string): Promise<DeleteAck> {
  const { data } = await api.delete<DeleteAck>(`/item/${itemId}/qr`);
  return data;
}

/** GET /warehouse/{warehouseId}/QR/{id} — id or payload. */
export async function resolveWarehouseQr(
  warehouseId: string,
  idOrPayload: string,
): Promise<ResolveQrResponse> {
  const { data } = await api.get<ResolveQrResponse>(
    `/warehouse/${warehouseId}/QR/${encodeURIComponent(idOrPayload)}`,
  );
  return data;
}

/** PUT /warehouse/{warehouseId}/location-unit/{locationUnitId}/item/{itemId} */
export async function bindItemToLocation(
  warehouseId: string,
  locationUnitId: string,
  itemId: string,
): Promise<CatalogItem> {
  const { data } = await api.put<{ item: CatalogItem }>(
    `/warehouse/${warehouseId}/location-unit/${locationUnitId}/item/${itemId}`,
  );
  return data.item;
}

export type WarehouseItemLocationFilter = 'none' | 'set' | 'all';

/** GET /item/{itemId} */
export async function fetchCatalogItem(itemId: string): Promise<CatalogItem> {
  const { data } = await api.get<{ item: CatalogItem }>(`/item/${itemId}`);
  return data.item;
}

/** GET /warehouse/{warehouseId}/item?location=none|set|all&q= */
export async function fetchWarehouseItems(
  warehouseId: string,
  location: WarehouseItemLocationFilter = 'all',
  q?: string,
): Promise<CatalogItem[]> {
  const query = q?.trim();
  const { data } = await api.get<{ items: CatalogItem[] }>(
    `/warehouse/${warehouseId}/item`,
    { params: { location, archived: '0', ...(query ? { q: query } : {}) } },
  );
  return data.items.filter((item) => item.quantityOwned > 0);
}

/** DELETE /warehouse/{warehouseId}/item/{itemId}/location */
export async function unbindItemLocation(
  warehouseId: string,
  itemId: string,
): Promise<CatalogItem> {
  const { data } = await api.delete<{ item: CatalogItem }>(
    `/warehouse/${warehouseId}/item/${itemId}/location`,
  );
  return data.item;
}

export function itemPhotoUrl(item: CatalogItem): string | null {
  const file = [...item.files]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((entry) => entry.publicUrl || entry.readUrl);
  return file?.publicUrl ?? file?.readUrl ?? null;
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
    const created = await createItemQr(item.id);
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
