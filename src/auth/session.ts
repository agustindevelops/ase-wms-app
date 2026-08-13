import { useSyncExternalStore } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from '@/firebase/auth/signOut';
import { getFirebaseAuth } from '@/firebase/config';

/** `loading` is the boot window before the SDK restores its persisted user. */
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

let status: SessionStatus = 'loading';
const listeners = new Set<() => void>();

function setStatus(next: SessionStatus): void {
  if (status === next) {
    return;
  }

  status = next;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionStatus(): SessionStatus {
  return status;
}

/**
 * Read the session from anywhere without re-validating against the backend —
 * navigation and screens trust this flag; only real requests prove the token.
 */
export function useSessionStatus(): SessionStatus {
  return useSyncExternalStore(subscribe, getSessionStatus);
}

export function useIsAuthenticated(): boolean {
  return useSessionStatus() === 'authenticated';
}

/** Mirror the SDK into the store. Call once, from the root. */
export function startSessionSync(): () => void {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    setStatus(user ? 'authenticated' : 'unauthenticated');
  });
}

/**
 * Used by the axios 401 handler: flip the flag immediately so the router swaps
 * to Login, then clear the SDK (which re-emits the same status).
 */
export function endSession(): void {
  setStatus('unauthenticated');
  void signOut();
}
