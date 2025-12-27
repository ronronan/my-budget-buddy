import {
  type User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { auth } from '@/config/firebase';

export const authService = {
  // Inscription
  async register(email: string, password: string, displayName?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Mettre à jour le profil si displayName fourni
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user;
  },

  // Connexion
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Déconnexion
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Réinitialisation mot de passe
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};
