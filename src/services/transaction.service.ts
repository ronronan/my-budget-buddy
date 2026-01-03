import { Timestamp, orderBy, where } from 'firebase/firestore';

import { categoryService } from '@/services/category.service';
import { firestoreService } from '@/services/firestore.service';
import { type Transaction, type TransactionInput, type TransactionWithCategories, validateTransactionSplits } from '@/types/budget.types';

const COLLECTION_NAME = 'transactions';

export const transactionService = {
  /**
   * Récupère toutes les transactions d'un utilisateur
   */
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await firestoreService.query<Transaction>(COLLECTION_NAME, where('userId', '==', userId), orderBy('date', 'desc'));

    return transactions.map(convertTimestamps);
  },

  /**
   * Récupère les transactions pour une période donnée
   */
  async getTransactionsByPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await firestoreService.query<Transaction>(
      COLLECTION_NAME,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc'),
    );

    return transactions.map(convertTimestamps);
  },

  /**
   * Récupère les transactions d'une catégorie spécifique
   */
  async getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    // Note: Firestore ne supporte pas array-contains-any avec where composé
    // Solution: récupérer toutes les transactions et filtrer côté client
    const allTransactions = await this.getUserTransactions(userId);

    return allTransactions.filter((t) => t.splits.some((s) => s.categoryId === categoryId));
  },

  /**
   * Récupère les transactions d'un type spécifique (income/expense)
   */
  async getTransactionsByType(userId: string, type: 'income' | 'expense'): Promise<Transaction[]> {
    const transactions = await firestoreService.query<Transaction>(
      COLLECTION_NAME,
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('date', 'desc'),
    );

    return transactions.map(convertTimestamps);
  },

  /**
   * Crée une nouvelle transaction avec validation
   */
  async createTransaction(userId: string, data: TransactionInput): Promise<string> {
    // Validation 1: Au moins 1 split
    if (data.splits.length === 0) {
      throw new Error('La transaction doit avoir au moins une catégorie');
    }

    // Validation 2: Somme des splits = montant total
    if (!validateTransactionSplits(data)) {
      const sumSplits = data.splits.reduce((sum, s) => sum + s.amount, 0);
      throw new Error(
        `La somme des montants (${sumSplits.toFixed(2)} €) doit être égale au montant total (${data.totalAmount.toFixed(2)} €)`,
      );
    }

    // Validation 3: Montants positifs
    if (data.totalAmount <= 0) {
      throw new Error('Le montant total doit être positif');
    }
    if (data.splits.some((s) => s.amount <= 0)) {
      throw new Error('Tous les montants doivent être positifs');
    }

    // Validation 4: Toutes les catégories existent et sont des sous-catégories
    const categories = await categoryService.getUserCategories(userId);
    const allSubcategories = categories.flatMap((c) => c.subcategories);

    for (const split of data.splits) {
      const category = allSubcategories.find((c) => c.id === split.categoryId);
      if (!category) {
        throw new Error(`Catégorie ${split.categoryId} introuvable`);
      }
      // Vérifier que c'est bien une sous-catégorie
      if (category.parentId === null) {
        throw new Error(`La catégorie "${category.name}" n'est pas une sous-catégorie. Veuillez sélectionner une sous-catégorie.`);
      }
    }

    // Créer la transaction
    const transactionData = {
      userId,
      totalAmount: data.totalAmount,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      type: data.type,
      splits: data.splits,
    };

    return await firestoreService.create(COLLECTION_NAME, transactionData);
  },

  /**
   * Met à jour une transaction existante
   */
  async updateTransaction(transactionId: string, userId: string, data: Partial<TransactionInput>): Promise<void> {
    // Si on met à jour les splits, revalider
    if (data.splits && data.totalAmount !== undefined) {
      const tempTransaction: TransactionInput = {
        totalAmount: data.totalAmount,
        description: data.description || '',
        date: data.date || new Date(),
        type: data.type || 'expense',
        splits: data.splits,
      };

      if (!validateTransactionSplits(tempTransaction)) {
        throw new Error('La somme des montants doit être égale au montant total');
      }
    }

    // Validation catégories si splits modifiés
    if (data.splits) {
      const categories = await categoryService.getUserCategories(userId);
      const allSubcategories = categories.flatMap((c) => c.subcategories);

      for (const split of data.splits) {
        const category = allSubcategories.find((c) => c.id === split.categoryId);
        if (!category || category.parentId === null) {
          throw new Error('Toutes les catégories doivent être des sous-catégories');
        }
      }
    }

    const updateData: Record<string, unknown> = {
      ...data,
      date: data.date ? Timestamp.fromDate(data.date) : undefined,
    };

    await firestoreService.update(COLLECTION_NAME, transactionId, updateData);
  },

  /**
   * Supprime une transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    await firestoreService.delete(COLLECTION_NAME, transactionId);
  },

  /**
   * Enrichit les transactions avec les détails des catégories
   */
  async enrichTransactionsWithCategories(transactions: Transaction[], userId: string): Promise<TransactionWithCategories[]> {
    const categories = await categoryService.getUserCategories(userId);
    const allCategories = [...categories, ...categories.flatMap((c) => c.subcategories)];

    return transactions.map((transaction) => ({
      ...transaction,
      categoriesDetails: transaction.splits.map((split) => {
        const category = allCategories.find((c) => c.id === split.categoryId);
        return {
          categoryId: split.categoryId,
          categoryName: category?.name || 'Catégorie supprimée',
          categoryColor: category?.color || '#9ca3af',
          categoryIcon: category?.icon,
          amount: split.amount,
        };
      }),
    }));
  },

  /**
   * Calcule les statistiques pour une période
   */
  async getStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    categoriesBreakdown: Record<string, number>;
  }> {
    const transactions = await this.getTransactionsByPeriod(userId, startDate, endDate);

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoriesBreakdown: Record<string, number> = {};

    transactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totalIncome += transaction.totalAmount;
      } else {
        totalExpenses += transaction.totalAmount;
      }

      // Compter par catégorie
      transaction.splits.forEach((split) => {
        categoriesBreakdown[split.categoryId] = (categoriesBreakdown[split.categoryId] || 0) + split.amount;
      });
    });

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoriesBreakdown,
    };
  },
};

// Helper pour convertir Timestamps en Dates
function convertTimestamps(transaction: Transaction): Transaction {
  return {
    ...transaction,
    date: transaction.date instanceof Timestamp ? transaction.date.toDate() : transaction.date,
    createdAt: transaction.createdAt instanceof Timestamp ? transaction.createdAt.toDate() : transaction.createdAt,
    updatedAt: transaction.updatedAt instanceof Timestamp ? transaction.updatedAt.toDate() : transaction.updatedAt,
  };
}
