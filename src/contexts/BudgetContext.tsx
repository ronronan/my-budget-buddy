import { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { categoryService } from '@/services/category.service';
import { type CategoryInput, type CategoryWithSubcategories } from '@/types/budget.types';

interface BudgetContextType {
  categories: CategoryWithSubcategories[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryInput) => Promise<void>;
  updateCategory: (id: string, data: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;
}

interface BudgetProviderProps {
  children: React.ReactNode;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: BudgetProviderProps) {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const userCategories = await categoryService.getUserCategories(user.uid);

      // Si aucune catégorie, créer les catégories par défaut
      if (userCategories.length === 0) {
        await categoryService.createDefaultCategories(user.uid);
        const defaultCategories = await categoryService.getUserCategories(user.uid);
        setCategories(defaultCategories);
      } else {
        setCategories(userCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      const message = 'Erreur lors du chargement des catégories';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les catégories au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [user, fetchCategories]);

  const createCategory = async (data: CategoryInput) => {
    if (!user) return;

    try {
      setError(null);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempCategory: CategoryWithSubcategories = {
        id: tempId,
        userId: user.uid,
        name: data.name,
        color: data.color,
        icon: data.icon,
        budget: data.budget,
        parentId: data.parentId ?? null,
        order: categories.length,
        createdAt: new Date(),
        subcategories: [],
      };

      if (data.parentId) {
        // Ajouter à la sous-catégorie
        setCategories((prev) =>
          prev.map((cat) => (cat.id === data.parentId ? { ...cat, subcategories: [...cat.subcategories, tempCategory] } : cat)),
        );
      } else {
        // Ajouter comme catégorie racine
        setCategories((prev) => [...prev, tempCategory]);
      }

      // Créer dans Firestore
      await categoryService.createCategory(user.uid, data);
      toast.success('Catégorie créée');

      // Recharger pour avoir l'ID réel
      await fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la catégorie';
      setError(message);
      toast.error(message);
      // Rollback optimistic update
      await fetchCategories();
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<CategoryInput>) => {
    if (!user) return;

    try {
      setError(null);

      // Optimistic update
      const updateCategoryInList = (cats: CategoryWithSubcategories[]): CategoryWithSubcategories[] => {
        return cats.map((cat) => {
          if (cat.id === id) {
            return { ...cat, ...data };
          }
          if (cat.subcategories.length > 0) {
            return {
              ...cat,
              subcategories: cat.subcategories.map((sub) => (sub.id === id ? { ...sub, ...data } : sub)),
            };
          }
          return cat;
        });
      };

      setCategories(updateCategoryInList);

      // Mettre à jour dans Firestore
      await categoryService.updateCategory(id, data);
      toast.success('Catégorie modifiée');
    } catch (err) {
      console.error('Error updating category:', err);
      const message = 'Erreur lors de la modification de la catégorie';
      setError(message);
      toast.error(message);
      // Rollback
      await fetchCategories();
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      setError(null);

      // Optimistic update
      setCategories((prev) =>
        prev
          .filter((cat) => cat.id !== id)
          .map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.filter((sub) => sub.id !== id),
          })),
      );

      // Supprimer dans Firestore
      await categoryService.deleteCategory(id);
      toast.success('Catégorie supprimée');
    } catch (err) {
      console.error('Error deleting category:', err);
      const message = 'Erreur lors de la suppression de la catégorie';
      setError(message);
      toast.error(message);
      // Rollback
      await fetchCategories();
      throw err;
    }
  };

  const reorderCategories = async (categoryIds: string[]) => {
    if (!user) return;

    try {
      setError(null);

      // Optimistic update
      const reordered = categoryIds
        .map((id) => categories.find((cat) => cat.id === id))
        .filter((cat): cat is CategoryWithSubcategories => cat !== undefined);
      setCategories(reordered);

      // Mettre à jour dans Firestore
      await categoryService.reorderCategories(categoryIds);
    } catch (err) {
      console.error('Error reordering categories:', err);
      const message = 'Erreur lors du réordonnancement des catégories';
      setError(message);
      toast.error(message);
      // Rollback
      await fetchCategories();
      throw err;
    }
  };

  const value: BudgetContextType = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export { BudgetContext };
