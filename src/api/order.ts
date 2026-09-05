import { api } from './client';

/**
 * ASE-4 pickup / return data contract.
 *
 * GET  /order/pickup
 * GET  /order/pickup/{orderId}
 * GET  /order/pickup/{orderId}/scan?payload=
 * POST /order/pickup/{orderId}
 * GET  /order/return
 * GET  /order/return/{orderId}
 * GET  /order/return/{orderId}/scan?payload=&itemId=
 * POST /order/return/{orderId}
 * POST /order/return/{orderId}/issue
 */

export type OrderFulfillmentMode = 'pickup' | 'return';

export type FulfillmentLine = {
  id: string;
  itemId: string;
  qtyRequested: number;
  qtyPicked: number;
  qtyReturned: number;
  qtyRemaining: number;
  qtyOutstanding: number;
  qtyIssued: number;
  item: {
    id: string;
    name: string;
    warehouseId: string | null;
    quantityOwned: number;
    quantityAvailable: number;
    archived: boolean;
    locationLabel: string | null;
    locationUnit: {
      id: string;
      name: string;
      label: string | null;
      warehouseId: string;
    } | null;
  };
};

export type FulfillmentOrder = {
  id: string;
  name: string;
  eventDate: string | null;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  status: { id: string; code: string; name: string };
  lines: FulfillmentLine[];
};

export type FulfillmentScanResponse = {
  typeCode: number;
  locationUnit: {
    id: string;
    warehouseId: string;
    name: string;
    label: string | null;
    qrCodeId: string | null;
  } | null;
  line: FulfillmentLine | null;
};

export const QR_TYPE_ITEM = 0;
export const QR_TYPE_LOCATION = 1;

function basePath(mode: OrderFulfillmentMode) {
  return mode === 'pickup' ? '/order/pickup' : '/order/return';
}

export async function listFulfillmentOrders(
  mode: OrderFulfillmentMode,
): Promise<FulfillmentOrder[]> {
  const { data } = await api.get<{ orders: FulfillmentOrder[] }>(basePath(mode));
  return data.orders;
}

export async function getFulfillmentOrder(
  mode: OrderFulfillmentMode,
  orderId: string,
): Promise<FulfillmentOrder> {
  const { data } = await api.get<{ order: FulfillmentOrder }>(
    `${basePath(mode)}/${orderId}`,
  );
  return data.order;
}

export async function scanFulfillmentQr(
  mode: OrderFulfillmentMode,
  orderId: string,
  payload: string,
  itemId?: string,
): Promise<FulfillmentScanResponse> {
  const { data } = await api.get<FulfillmentScanResponse>(
    `${basePath(mode)}/${orderId}/scan`,
    { params: { payload, ...(itemId ? { itemId } : {}) } },
  );
  return data;
}

export async function pickOrderLine(
  orderId: string,
  itemId: string,
  qty: number,
): Promise<FulfillmentOrder> {
  const { data } = await api.post<{ order: FulfillmentOrder }>(
    `/order/pickup/${orderId}`,
    { itemId, qty },
  );
  return data.order;
}

export async function returnOrderLine(
  orderId: string,
  itemId: string,
  qty: number,
  locationUnitId: string,
): Promise<FulfillmentOrder> {
  const { data } = await api.post<{ order: FulfillmentOrder }>(
    `/order/return/${orderId}`,
    { itemId, qty, locationUnitId },
  );
  return data.order;
}

export async function reportReturnIssue(
  orderId: string,
  body: {
    itemId: string;
    type: 'MISSING' | 'BROKEN';
    quantity: number;
    notes?: string | null;
  },
): Promise<FulfillmentOrder> {
  const { data } = await api.post<{ order: FulfillmentOrder }>(
    `/order/${orderId}/issue`,
    body,
  );
  return data.order;
}
