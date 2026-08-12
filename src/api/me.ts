import { wmsJson } from './wmsFetch';

export type MeUser = {
  id: string;
  firebaseUid: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type MeResponse = {
  user: MeUser;
};

/** Prisma-backed protected GET — ASE-10 smoke. */
export function fetchMe(): Promise<MeResponse> {
  return wmsJson<MeResponse>('/api/me');
}
