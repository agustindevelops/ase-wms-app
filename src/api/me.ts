import { api } from './client';
import { getFirebaseAuth } from '@/firebase/config';

export type MeUser = {
  id: string;
  firebaseUid: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type MeWarehouse = {
  id: string;
  name: string;
};

/** Org-membership session. warehouse is the first org warehouse until a picker exists. */
export type MeResponse = {
  user: MeUser;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: {
    code: string;
    name: string;
  };
  warehouses: MeWarehouse[];
  warehouse: MeWarehouse;
  tokenRefreshRequired?: boolean;
};

/**
 * GET /api/me — user + organization from ORGANIZATION_MEMBERSHIP.
 * Catalog / Manage Warehouse still use warehouse.id as the path param.
 */
export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<Omit<MeResponse, 'warehouse'> & {
    warehouse?: MeWarehouse;
  }>('/api/me');
  if (data.tokenRefreshRequired) {
    const user = getFirebaseAuth().currentUser;
    if (user) {
      await user.getIdToken(true);
    }
  }
  const warehouse = data.warehouse ?? data.warehouses[0];
  if (!warehouse) {
    throw new Error('No warehouse in this organization');
  }
  return { ...data, warehouse, warehouses: data.warehouses ?? [warehouse] };
}
