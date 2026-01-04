import { Timestamp, collection, doc, writeBatch } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { simpleTransactionSchema } from '@/lib/validation/transaction.schema';
import { categoryService } from '@/services/category.service';
import { type ParsedTransaction } from '@/services/csv-parser.service';

const COLLECTION_NAME = 'transactions';

export interface ImportError {
  transaction: ParsedTransaction;
  error: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: ImportError[];
  transactionIds: string[];
}

/**
 * Service d'import de transactions depuis CSV
 */
export const importService = {
  /**
   * S'assure que la catégorie "À classer > Non catégorisé" existe
   * Retourne l'ID de la sous-catégorie
   */
  async ensureUnclassifiedCategory(userId: string): Promise<string> {
    // 1. Récupérer toutes les catégories de l'utilisateur
    const categories = await categoryService.getUserCategories(userId);

    // 2. Chercher la catégorie parente "À classer"
    let unclassifiedParent = categories.find((c) => c.name === 'À classer');

    // 3. Si elle n'existe pas, la créer
    if (!unclassifiedParent) {
      const parentId = await categoryService.createCategory(userId, {
        name: 'À classer',
        color: '#94a3b8',
        icon: 'IconQuestionMark',
        type: 'expense',
      });

      // Recharger pour avoir l'objet complet
      const updated = await categoryService.getUserCategories(userId);
      unclassifiedParent = updated.find((c) => c.id === parentId);

      if (!unclassifiedParent) {
        throw new Error('Erreur lors de la création de la catégorie "À classer"');
      }
    }

    // 4. Chercher la sous-catégorie "Non catégorisé"
    const unclassifiedSub = unclassifiedParent.subcategories.find((s) => s.name === 'Non catégorisé');

    // 5. Si elle n'existe pas, la créer
    if (!unclassifiedSub) {
      const subId = await categoryService.createCategory(userId, {
        name: 'Non catégorisé',
        color: '#94a3b8',
        icon: 'IconQuestionMark',
        type: 'expense',
        parentId: unclassifiedParent.id,
      });

      return subId;
    }

    return unclassifiedSub.id;
  },

  /**
   * Importe des transactions parsées vers Firestore
   */
  async importTransactions(
    parsedTransactions: ParsedTransaction[],
    options: {
      unclassifiedCategoryId: string;
      userId: string;
    },
  ): Promise<ImportResult> {
    const { unclassifiedCategoryId, userId } = options;

    const transactionIds: string[] = [];
    const errors: ImportError[] = [];

    try {
      // Firestore limite: 500 opérations par batch
      // Diviser en chunks si nécessaire
      const BATCH_SIZE = 500;
      const chunks: ParsedTransaction[][] = [];

      for (let i = 0; i < parsedTransactions.length; i += BATCH_SIZE) {
        chunks.push(parsedTransactions.slice(i, i + BATCH_SIZE));
      }

      // Traiter chaque chunk
      for (const chunk of chunks) {
        const batch = writeBatch(db);

        for (const parsed of chunk) {
          try {
            // Créer TransactionInput conforme au modèle
            const transactionInput = {
              totalAmount: parsed.amount,
              categoryId: unclassifiedCategoryId,
              description: parsed.description,
              date: parsed.date,
              type: parsed.type,
            };

            // Valider avec Zod
            simpleTransactionSchema.parse(transactionInput);

            // Créer document Firestore
            const docRef = doc(collection(db, COLLECTION_NAME));
            const transactionData = {
              userId,
              totalAmount: parsed.amount,
              description: parsed.description,
              date: Timestamp.fromDate(parsed.date),
              type: parsed.type,
              splits: [
                {
                  categoryId: unclassifiedCategoryId,
                  amount: parsed.amount,
                },
              ],
              importMetadata: {
                source: 'csv',
                importDate: Timestamp.now(),
                originalDescription: parsed.originalDescription,
                deduplicationKey: parsed.deduplicationKey,
              },
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };

            batch.set(docRef, transactionData);
            transactionIds.push(docRef.id);
          } catch (error) {
            errors.push({
              transaction: parsed,
              error: error instanceof Error ? error.message : 'Erreur inconnue',
            });
          }
        }

        // Commit le batch
        await batch.commit();
      }

      return {
        success: errors.length === 0,
        imported: transactionIds.length,
        duplicates: 0, // Sera calculé en amont
        errors,
        transactionIds,
      };
    } catch (error) {
      console.error('Import batch failed:', error);
      throw new Error("Échec de l'import des transactions");
    }
  },
};
