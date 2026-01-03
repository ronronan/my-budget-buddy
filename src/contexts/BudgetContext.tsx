import { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { categoryService } from '@/services/category.service';
import { livretService } from '@/services/livret.service';
import { transactionService } from '@/services/transaction.service';
import {
  type CategoryInput,
  type CategoryWithSubcategories,
  type Livret,
  type LivretInput,
  type TransactionInput,
  type TransactionWithCategories,
} from '@/types/budget.types';

interface BudgetContextType {
  categories: CategoryWithSubcategories[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryInput) => Promise<void>;
  updateCategory: (id: string, data: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;

  livrets: Livret[];
  livretsLoading: boolean;
  fetchLivrets: () => Promise<void>;
  createLivret: (data: LivretInput) => Promise<void>;
  updateLivret: (id: string, data: Partial<LivretInput>) => Promise<void>;
  deleteLivret: (id: string) => Promise<void>;

  transactions: TransactionWithCategories[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

interface BudgetProviderProps {
  children: React.ReactNode;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: BudgetProviderProps) {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [livrets, setLivrets] = useState<Livret[]>([]);
  const [livretsLoading, setLivretsLoading] = useState(false);

  const [transactions, setTransactions] = useState<TransactionWithCategories[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

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

  // ========== LIVRETS ==========

  const fetchLivrets = useCallback(async () => {
    if (!user) return;

    try {
      setLivretsLoading(true);
      const userLivrets = await livretService.getUserLivrets(user.uid);
      setLivrets(userLivrets);
    } catch (err) {
      console.error('Error fetching livrets:', err);
      const message = 'Erreur lors du chargement des livrets';
      toast.error(message);
    } finally {
      setLivretsLoading(false);
    }
  }, [user]);

  // Charger les livrets au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      fetchLivrets();
    } else {
      setLivrets([]);
    }
  }, [user, fetchLivrets]);

  const createLivret = async (data: LivretInput) => {
    if (!user) return;

    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempLivret: Livret = {
        id: tempId,
        userId: user.uid,
        name: data.name,
        soldeDepart: data.soldeDepart,
        createdAt: new Date(),
      };

      setLivrets((prev) => [tempLivret, ...prev]);

      // Créer dans Firestore
      await livretService.createLivret(user.uid, data);
      toast.success('Livret créé');

      // Recharger pour avoir l'ID réel
      await fetchLivrets();
    } catch (err) {
      console.error('Error creating livret:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du livret';
      toast.error(message);
      // Rollback optimistic update
      await fetchLivrets();
      throw err;
    }
  };

  const updateLivret = async (id: string, data: Partial<LivretInput>) => {
    if (!user) return;

    try {
      // Optimistic update
      setLivrets((prev) => prev.map((livret) => (livret.id === id ? { ...livret, ...data } : livret)));

      // Mettre à jour dans Firestore
      await livretService.updateLivret(id, data);
      toast.success('Livret modifié');
    } catch (err) {
      console.error('Error updating livret:', err);
      const message = 'Erreur lors de la modification du livret';
      toast.error(message);
      // Rollback
      await fetchLivrets();
      throw err;
    }
  };

  const deleteLivret = async (id: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setLivrets((prev) => prev.filter((livret) => livret.id !== id));

      // Supprimer dans Firestore
      await livretService.deleteLivret(id);
      toast.success('Livret supprimé');
    } catch (err) {
      console.error('Error deleting livret:', err);
      const message = 'Erreur lors de la suppression du livret';
      toast.error(message);
      // Rollback
      await fetchLivrets();
      throw err;
    }
  };

  // ========== TRANSACTIONS ==========

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      setTransactionsLoading(true);
      setTransactionsError(null);

      const userTransactions = await transactionService.getUserTransactions(user.uid);
      const enriched = await transactionService.enrichTransactionsWithCategories(userTransactions, user.uid);
      setTransactions(enriched);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      const message = 'Erreur lors du chargement des transactions';
      setTransactionsError(message);
      toast.error(message);
    } finally {
      setTransactionsLoading(false);
    }
  }, [user]);

  // Charger les transactions au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [user, fetchTransactions]);

  const createTransaction = async (data: TransactionInput) => {
    if (!user) return;

    try {
      setTransactionsError(null);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;

      // Enrichir les détails des catégories pour l'optimistic update
      const categoriesDetails = await Promise.all(
        data.splits.map(async (split) => {
          const allCategories = [...categories, ...categories.flatMap((c) => c.subcategories)];
          const category = allCategories.find((c) => c.id === split.categoryId);
          return {
            categoryId: split.categoryId,
            categoryName: category?.name || 'Catégorie supprimée',
            categoryColor: category?.color || '#9ca3af',
            categoryIcon: category?.icon,
            amount: split.amount,
          };
        }),
      );

      const tempTransaction: TransactionWithCategories = {
        id: tempId,
        userId: user.uid,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        categoriesDetails,
      };

      setTransactions((prev) => [tempTransaction, ...prev]);

      // Créer dans Firestore
      await transactionService.createTransaction(user.uid, data);
      toast.success('Transaction créée');

      // Recharger pour avoir l'ID réel
      await fetchTransactions();
    } catch (err) {
      console.error('Error creating transaction:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la transaction';
      setTransactionsError(message);
      toast.error(message);
      // Rollback
      await fetchTransactions();
      throw err;
    }
  };

  const updateTransaction = async (id: string, data: Partial<TransactionInput>) => {
    if (!user) return;

    try {
      setTransactionsError(null);

      // Optimistic update
      setTransactions((prev) =>
        prev.map((transaction) => {
          if (transaction.id === id) {
            return { ...transaction, ...data };
          }
          return transaction;
        }),
      );

      // Mettre à jour dans Firestore
      await transactionService.updateTransaction(id, user.uid, data);
      toast.success('Transaction modifiée');

      // Recharger pour avoir les données enrichies
      await fetchTransactions();
    } catch (err) {
      console.error('Error updating transaction:', err);
      const message = 'Erreur lors de la modification de la transaction';
      setTransactionsError(message);
      toast.error(message);
      // Rollback
      await fetchTransactions();
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      setTransactionsError(null);

      // Optimistic update
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));

      // Supprimer dans Firestore
      await transactionService.deleteTransaction(id);
      toast.success('Transaction supprimée');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      const message = 'Erreur lors de la suppression de la transaction';
      setTransactionsError(message);
      toast.error(message);
      // Rollback
      await fetchTransactions();
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
    livrets,
    livretsLoading,
    fetchLivrets,
    createLivret,
    updateLivret,
    deleteLivret,
    transactions,
    transactionsLoading,
    transactionsError,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export { BudgetContext };
