import { z } from 'zod';

// Schéma pour un split individuel
export const transactionSplitSchema = z.object({
  categoryId: z.string().min(1, 'La catégorie est requise'),
  amount: z.number({ message: 'Le montant est requis' }),
});

// Schéma pour mode SIMPLE (1 catégorie)
export const simpleTransactionSchema = z.object({
  totalAmount: z.number().positive('Le montant doit être positif'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  description: z.string().min(1, 'La description est requise').max(200, 'La description ne peut pas dépasser 200 caractères'),
  date: z.date(),
  type: z.enum(['income', 'expense'], { message: 'Type invalide' }),
});

// Schéma pour mode SPLITS (multi-catégories)
export const splitTransactionSchema = z
  .object({
    totalAmount: z.number().positive('Le montant total doit être positif'),
    splits: z.array(transactionSplitSchema).min(1, 'Au moins une catégorie est requise'),
    description: z.string().min(1, 'La description est requise').max(200, 'La description ne peut pas dépasser 200 caractères'),
    date: z.date(),
    type: z.enum(['income', 'expense'], { message: 'Type invalide' }),
  })
  .refine(
    (data) => {
      const sumSplits = data.splits.reduce((sum, s) => sum + s.amount, 0);
      return Math.abs(sumSplits - data.totalAmount) < 0.01;
    },
    {
      message: 'La somme des montants doit être égale au montant total',
      path: ['splits'],
    },
  );

export type SimpleTransactionFormData = z.infer<typeof simpleTransactionSchema>;
export type SplitTransactionFormData = z.infer<typeof splitTransactionSchema>;
