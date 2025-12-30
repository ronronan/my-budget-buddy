// Types pour les données budget (à adapter selon besoins)
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  budget?: number;
  parentId: string | null;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
}

export interface CategoryInput {
  name: string;
  color: string;
  icon?: string;
  budget?: number;
  parentId?: string | null;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoriesBreakdown: Record<string, number>;
}

export interface Livret {
  id: string;
  userId: string;
  name: string;
  soldeDepart: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LivretInput {
  name: string;
  soldeDepart: number;
}
