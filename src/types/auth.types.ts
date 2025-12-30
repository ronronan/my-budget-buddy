import { type User } from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const mapFirebaseUser = (firebaseUser: User): AppUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  photoURL: firebaseUser.photoURL,
});
