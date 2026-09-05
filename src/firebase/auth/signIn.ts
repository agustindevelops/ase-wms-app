import { signInWithCustomToken } from 'firebase/auth';
import { aseWisApiUrl } from '@/config/env';
import { getFirebaseAuth } from '../config';

function messageForLoginError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

export async function signIn(email: string, password: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed || !password) {
    throw new Error('Email and password are required.');
  }

  if (!aseWisApiUrl) {
    throw new Error(
      'EXPO_PUBLIC_ASE_WIS_API_URL is not set. Add it to .env (no trailing slash).',
    );
  }

  try {
    const response = await fetch(`${aseWisApiUrl.replace(/\/$/, '')}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed, password }),
    });
    const payload = (await response.json()) as {
      customToken?: string;
      message?: string;
    };

    if (!response.ok || !payload.customToken) {
      throw new Error(payload.message ?? 'Invalid email or password.');
    }

    await signInWithCustomToken(getFirebaseAuth(), payload.customToken);
  } catch (error) {
    if (error instanceof Error && error.message === 'Network request failed') {
      throw new Error('Network error. Check your connection.');
    }
    throw new Error(messageForLoginError(error));
  }
}
