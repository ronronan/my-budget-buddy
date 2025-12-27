import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { auth } from '@/config/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { authService } from '@/services/auth.service';
import { type AppUser, type AuthContextType, type AuthProviderProps, mapFirebaseUser } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(mapFirebaseUser(firebaseUser));
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const firebaseUser = await authService.login(email, password);
      setUser(mapFirebaseUser(firebaseUser));
      toast.success('Connexion réussie!');
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage((err as { code: string }).code);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      const firebaseUser = await authService.register(email, password, displayName);
      setUser(mapFirebaseUser(firebaseUser));
      toast.success('Compte créé avec succès!');
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage((err as { code: string }).code);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage((err as { code: string }).code);
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
      toast.success('Email de réinitialisation envoyé!');
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage((err as { code: string }).code);
      setError(message);
      toast.error(message);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
