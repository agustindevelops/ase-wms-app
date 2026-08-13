import { api } from './client';
import { getFirebaseAuth } from '@/firebase/config';

export type MeUser = {
  id: string;
  firebaseUid: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

/** Membership-backed session. warehouse.id is the ASE-21 path param. */
export type MeResponse = {
  user: MeUser;
  warehouse: {
    id: string;
    name: string;
  };
  role: {
    code: string;
    name: string;
  };
  tokenRefreshRequired?: boolean;
};

/**
 * GET /api/me — user + the warehouse from WAREHOUSE_MEMBERSHIP.
 * Manage Warehouse must call /api/warehouse/{warehouse.id}/… with this id
 * (ASE-21). Do not hardcode a default warehouse.
 */
export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/api/me');
  if (data.tokenRefreshRequired) {
    const user = getFirebaseAuth().currentUser;
    if (user) {
      await user.getIdToken(true);
    }
  }
  return data;
}
