import { aseWmsApiUrl } from '@/config/env';
import { getFirebaseAuth } from '@/firebase/config';

export class WmsApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'WmsApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Call ase-wms-web `/api/*` with a fresh Firebase ID token.
 * Token refresh is owned by the Firebase SDK (`user.getIdToken()`).
 */
export async function wmsFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!aseWmsApiUrl) {
    throw new Error(
      'EXPO_PUBLIC_ASE_WMS_API_URL is not set. Add it to .env (no trailing slash).',
    );
  }

  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new WmsApiError(401, 'Not signed in');
  }

  const idToken = await user.getIdToken();
  const url = `${aseWmsApiUrl}${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...init.headers,
    },
  });
}

export async function wmsJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await wmsFetch(path, init);
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed (${response.status})`;
    throw new WmsApiError(response.status, message, body);
  }

  return body as T;
}
