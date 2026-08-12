import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '../config';

function messageForAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return error.message;
    }
  }
  return error instanceof Error ? error.message : String(error);
}

export async function signIn(email: string, password: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed || !password) {
    throw new Error('Email and password are required.');
  }

  try {
    await signInWithEmailAndPassword(getFirebaseAuth(), trimmed, password);
  } catch (error) {
    throw new Error(messageForAuthError(error));
  }
}
