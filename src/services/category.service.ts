import { Timestamp, doc, orderBy, where, writeBatch } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { firestoreService } from '@/services/firestore.service';
import { type Category, type CategoryInput, type CategoryWithSubcategories } from '@/types/budget.types';

const COLLECTION_NAME = 'categories';

const DEFAULT_CATEGORIES = [
  { name: 'Alimentation', color: '#10b981', icon: 'IconShoppingCart', order: 0, parentId: null },
  { name: 'Transport', color: '#3b82f6', icon: 'IconCar', order: 1, parentId: null },
  { name: 'Logement', color: '#f59e0b', icon: 'IconHome', order: 2, parentId: null },
  { name: 'Loisirs', color: '#ec4899', icon: 'IconDeviceGamepad2', order: 3, parentId: null },
  { name: 'Santé', color: '#ef4444', icon: 'IconFirstAidKit', order: 4, parentId: null },
  { name: 'Revenus', color: '#22c55e', icon: 'IconMoneybag', order: 5, parentId: null },
];

export const categoryService = {
  /**
   * Récupère toutes les catégories de l'utilisateur et les organise en hiérarchie
   */
  async getUserCategories(userId: string): Promise<CategoryWithSubcategories[]> {
    const categories = await firestoreService.query<Category>(COLLECTION_NAME, where('userId', '==', userId), orderBy('order', 'asc'));

    // Convertir Timestamps en Dates
    const categoriesWithDates = categories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt instanceof Timestamp ? cat.createdAt.toDate() : cat.createdAt,
      updatedAt: cat.updatedAt instanceof Timestamp ? cat.updatedAt.toDate() : cat.updatedAt,
    }));

    // Séparer parents et enfants
    const parents = categoriesWithDates.filter((cat) => cat.parentId === null);
    const children = categoriesWithDates.filter((cat) => cat.parentId !== null);

    // Construire la hiérarchie
    const categoriesWithSubs: CategoryWithSubcategories[] = parents.map((parent) => ({
      ...parent,
      subcategories: children.filter((child) => child.parentId === parent.id).sort((a, b) => a.order - b.order),
    }));

    return categoriesWithSubs;
  },

  /**
   * Crée une nouvelle catégorie
   */
  async createCategory(userId: string, data: CategoryInput): Promise<string> {
    // Calculer l'ordre automatiquement
    const existing = await firestoreService.query<Category>(
      COLLECTION_NAME,
      where('userId', '==', userId),
      where('parentId', '==', data.parentId || null),
    );

    const maxOrder = existing.length > 0 ? Math.max(...existing.map((cat) => cat.order)) : -1;
    const newOrder = maxOrder + 1;

    // Valider que le parent existe si fourni
    if (data.parentId) {
      const parent = await firestoreService.getById<Category>(COLLECTION_NAME, data.parentId);
      if (!parent || parent.userId !== userId) {
        throw new Error('Catégorie parente invalide');
      }
      // Empêcher plus de 2 niveaux
      if (parent.parentId !== null) {
        throw new Error('Impossible de créer une sous-sous-catégorie');
      }
    }

    const categoryData = {
      userId,
      name: data.name,
      color: data.color,
      icon: data.icon || null,
      budget: data.budget || null,
      parentId: data.parentId || null,
      order: newOrder,
    };

    return await firestoreService.create(COLLECTION_NAME, categoryData);
  },

  /**
   * Met à jour une catégorie existante
   */
  async updateCategory(categoryId: string, data: Partial<CategoryInput>): Promise<void> {
    // Ne pas permettre de changer le parentId (pour simplifier)
    const updateData = { ...data };
    delete updateData.parentId;

    await firestoreService.update(COLLECTION_NAME, categoryId, updateData);
  },

  /**
   * Supprime une catégorie (et ses sous-catégories si c'est un parent)
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const category = await firestoreService.getById<Category>(COLLECTION_NAME, categoryId);
    if (!category) {
      throw new Error('Catégorie introuvable');
    }

    // Si c'est un parent, récupérer et supprimer les enfants
    const subcategories = await firestoreService.query<Category>(COLLECTION_NAME, where('parentId', '==', categoryId));

    // Supprimer la catégorie et ses enfants
    const batch = writeBatch(db);

    batch.delete(doc(db, COLLECTION_NAME, categoryId));
    subcategories.forEach((sub) => {
      batch.delete(doc(db, COLLECTION_NAME, sub.id));
    });

    await batch.commit();
  },

  /**
   * Réorganise les catégories (drag & drop)
   */
  async reorderCategories(categoryIds: string[]): Promise<void> {
    const batch = writeBatch(db);

    categoryIds.forEach((id, index) => {
      const ref = doc(db, COLLECTION_NAME, id);
      batch.update(ref, {
        order: index,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  },

  /**
   * Crée les catégories par défaut pour un nouvel utilisateur
   */
  async createDefaultCategories(userId: string): Promise<void> {
    const promises = DEFAULT_CATEGORIES.map((cat) => this.createCategory(userId, cat));
    await Promise.all(promises);
  },

  /**
   * Vérifie si l'utilisateur a des catégories
   */
  async hasCategories(userId: string): Promise<boolean> {
    const categories = await firestoreService.query<Category>(COLLECTION_NAME, where('userId', '==', userId));
    return categories.length > 0;
  },
};
