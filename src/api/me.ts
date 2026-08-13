import { api } from './client';

export type MeUser = {
  id: string;
  firebaseUid: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

/** Authorization is warehouse-scoped: the role comes from the membership. */
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
};

/** Prisma-backed protected GET — ASE-10 smoke. */
export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/api/me');
  return data;
}
