import { signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth } from '../config';

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}
