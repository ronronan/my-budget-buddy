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

// Budget mensuel : 12 montants pour l'année (janvier = 1, décembre = 12)
export type MonthlyBudget = Record<number, number>;

// Budgets annuels : année => budgets mensuels
export type YearlyBudgets = Record<number, MonthlyBudget>;

// Helper pour créer un budget mensuel vide
export const createEmptyMonthlyBudget = (): MonthlyBudget => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
});

// Helper pour obtenir le budget d'une année spécifique (avec migration depuis monthlyBudgets)
export const getBudgetForYear = (category: Category, year: number): MonthlyBudget => {
  // Si yearlyBudgets existe, retourner le budget de l'année demandée
  if (category.yearlyBudgets && category.yearlyBudgets[year]) {
    return category.yearlyBudgets[year];
  }
  // Migration : si monthlyBudgets existe et qu'on demande l'année courante, le retourner
  if (category.monthlyBudgets && year === new Date().getFullYear()) {
    return category.monthlyBudgets;
  }
  // Sinon, retourner un budget vide
  return createEmptyMonthlyBudget();
};

// Helper pour mettre à jour le budget d'une année
export const updateBudgetForYear = (category: Category, year: number, monthlyBudget: MonthlyBudget): YearlyBudgets => {
  const yearlyBudgets = category.yearlyBudgets || {};
  return {
    ...yearlyBudgets,
    [year]: monthlyBudget,
  };
};

// Noms des mois pour affichage
export const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  budget?: number; // @deprecated - utilisé uniquement pour compatibilité rétroactive
  monthlyBudgets?: MonthlyBudget; // @deprecated - Budgets mensuels pour l'année courante (migration vers yearlyBudgets)
  yearlyBudgets?: YearlyBudgets; // Budgets mensuels par année
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
  budget?: number; // @deprecated
  monthlyBudgets?: MonthlyBudget; // @deprecated
  yearlyBudgets?: YearlyBudgets;
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
