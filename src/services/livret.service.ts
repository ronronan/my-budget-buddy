import { Timestamp, orderBy, where } from 'firebase/firestore';

import { firestoreService } from '@/services/firestore.service';
import { type Livret, type LivretInput } from '@/types/budget.types';

const COLLECTION_NAME = 'livrets';

export const livretService = {
  /**
   * Récupère tous les livrets de l'utilisateur
   */
  async getUserLivrets(userId: string): Promise<Livret[]> {
    const livrets = await firestoreService.query<Livret>(COLLECTION_NAME, where('userId', '==', userId), orderBy('createdAt', 'desc'));

    // Convertir Timestamps en Dates
    const livretsWithDates = livrets.map((livret) => ({
      ...livret,
      createdAt: livret.createdAt instanceof Timestamp ? livret.createdAt.toDate() : livret.createdAt,
      updatedAt: livret.updatedAt instanceof Timestamp ? livret.updatedAt.toDate() : livret.updatedAt,
    }));

    return livretsWithDates;
  },

  /**
   * Crée un nouveau livret
   */
  async createLivret(userId: string, data: LivretInput): Promise<string> {
    const livretData = {
      userId,
      name: data.name,
      soldeDepart: data.soldeDepart,
    };

    return await firestoreService.create(COLLECTION_NAME, livretData);
  },

  /**
   * Met à jour un livret existant
   */
  async updateLivret(livretId: string, data: Partial<LivretInput>): Promise<void> {
    await firestoreService.update(COLLECTION_NAME, livretId, data);
  },

  /**
   * Supprime un livret
   */
  async deleteLivret(livretId: string): Promise<void> {
    await firestoreService.delete(COLLECTION_NAME, livretId);
  },

  /**
   * Vérifie si l'utilisateur a des livrets
   */
  async hasLivrets(userId: string): Promise<boolean> {
    const livrets = await firestoreService.query<Livret>(COLLECTION_NAME, where('userId', '==', userId));
    return livrets.length > 0;
  },
};
