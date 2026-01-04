import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères').trim(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Format de couleur invalide'),
  icon: z.string().optional().nullable(),
  type: z.enum(['income', 'expense']).optional(),
  parentId: z.string().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
