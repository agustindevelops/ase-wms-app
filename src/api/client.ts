import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { endSession } from '@/auth/session';
import { aseWmsApiUrl } from '@/config/env';
import { getFirebaseAuth } from '@/firebase/config';

/** Rejected before the request leaves the device when there is no user. */
export class NotSignedInError extends Error {
  constructor() {
    super('Not signed in.');
    this.name = 'NotSignedInError';
  }
}

type RetriableConfig = InternalAxiosRequestConfig & {
  retriedWithFreshToken?: boolean;
};

export const api = axios.create({
  baseURL: aseWmsApiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * The SDK owns the token: `getIdToken()` returns the cached one and refreshes
 * transparently when it is close to expiring, so nothing is stored here.
 */
api.interceptors.request.use(async (config) => {
  if (!aseWmsApiUrl) {
    throw new Error(
      'EXPO_PUBLIC_ASE_WMS_API_URL is not set. Add it to .env (no trailing slash).',
    );
  }

  const user = getFirebaseAuth().currentUser;
  if (!user) {
    endSession();
    throw new NotSignedInError();
  }

  config.headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return config;
});

/**
 * A 401 means the backend rejected a token the SDK still considered good —
 * revoked, or clock skew. Retry once with a forced refresh; if that also fails
 * the session is genuinely over, so drop `isAuthenticated`.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status !== 401) {
      throw error;
    }

    const config = error.config as RetriableConfig | undefined;
    const user = getFirebaseAuth().currentUser;

    if (config && user && !config.retriedWithFreshToken) {
      config.retriedWithFreshToken = true;
      try {
        await user.getIdToken(true);
        return await api.request(config);
      } catch {
        // Refresh itself failed — fall through and end the session.
      }
    }

    endSession();
    throw error;
  },
);

/** Message for the UI: prefer the API's `message`, fall back to the transport. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message;
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timed out.';
    }

    if (!error.response) {
      return 'Network error. Check your connection.';
    }

    return `Request failed (${error.response.status}).`;
  }

  return error instanceof Error ? error.message : String(error);
}
