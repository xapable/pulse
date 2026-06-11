import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { app } from './clientApp';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── Sign in with Google ──
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// ── Sign out ──
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ── Auth state observer ──
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// ── Get current user ──
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export { auth };
