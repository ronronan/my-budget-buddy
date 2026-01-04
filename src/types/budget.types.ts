// Type pour un split de transaction (division entre plusieurs catégories)
export interface TransactionSplit {
  categoryId: string; // ID de la sous-catégorie
  amount: number; // Montant pour cette catégorie
}

// Transaction complète (version avec support des splits)
export interface Transaction {
  id: string;
  userId: string;
  totalAmount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  splits: TransactionSplit[]; // Divisions par catégorie

  // @deprecated - Compatibilité rétroactive
  category?: string;
  amount?: number;

  createdAt: Date;
  updatedAt: Date;
}

// Type pour input de création/modification (sans id, timestamps, userId)
export interface TransactionInput {
  totalAmount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  splits: TransactionSplit[];
}

// Type étendu pour l'UI avec les détails des catégories
export interface TransactionWithCategories extends Transaction {
  categoriesDetails: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon?: string;
    amount: number;
  }[];
}

// Helper pour créer une transaction simple (1 catégorie)
export const createSimpleTransaction = (
  amount: number,
  categoryId: string,
  description: string,
  date: Date,
  type: 'income' | 'expense',
): TransactionInput => ({
  totalAmount: amount,
  description,
  date,
  type,
  splits: [{ categoryId, amount }],
});

// Helper pour valider qu'une transaction a des splits valides
export const validateTransactionSplits = (transaction: TransactionInput): boolean => {
  if (transaction.splits.length === 0) return false;
  const sumSplits = transaction.splits.reduce((sum, split) => sum + split.amount, 0);
  // Comparer avec une tolérance pour éviter les problèmes de précision flottante
  return Math.abs(sumSplits - transaction.totalAmount) < 0.01;
};

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

// Soldes mensuels des livrets : 12 soldes pour l'année (janvier = 1, décembre = 12)
export type MonthlySoldes = Record<number, number>;

// Soldes annuels : année => soldes mensuels
export type YearlySoldes = Record<number, MonthlySoldes>;

// Helper pour créer des soldes mensuels vides (initialisés à 0)
export const createEmptyMonthlySoldes = (): MonthlySoldes => ({
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

// Helper pour obtenir les soldes d'une année spécifique
export const getSoldesForYear = (livret: Livret, year: number): MonthlySoldes => {
  // Si yearlySoldes existe, retourner les soldes de l'année demandée
  if (livret.yearlySoldes && livret.yearlySoldes[year]) {
    return livret.yearlySoldes[year];
  }
  // Sinon, retourner des soldes vides
  return createEmptyMonthlySoldes();
};

// Helper pour mettre à jour les soldes d'une année
export const updateSoldesForYear = (livret: Livret, year: number, monthlySoldes: MonthlySoldes): YearlySoldes => {
  const yearlySoldes = livret.yearlySoldes || {};
  return {
    ...yearlySoldes,
    [year]: monthlySoldes,
  };
};

// Helper pour calculer le solde effectif d'un mois donné
// Retourne null si l'année n'a pas de données enregistrées
// Retourne le solde (même 0) si l'année a des données (car 0 est une valeur valide)
export const getSoldeEffectif = (livret: Livret, year: number, month: number): number | null => {
  // Si l'année n'a pas de données enregistrées du tout, retourner null
  if (!livret.yearlySoldes || !livret.yearlySoldes[year]) {
    return null;
  }

  // Sinon, retourner la valeur (même si c'est 0, car c'est une valeur valide)
  const monthlySoldes = livret.yearlySoldes[year];
  return monthlySoldes[month];
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
  type?: 'income' | 'expense'; // Type de catégorie (revenu ou dépense) - optionnel pour rétrocompatibilité
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
  type?: 'income' | 'expense'; // Type de catégorie (revenu ou dépense)
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
  yearlySoldes?: YearlySoldes; // Soldes mensuels par année
  createdAt: Date;
  updatedAt?: Date;
}

export interface LivretInput {
  name: string;
  soldeDepart: number;
  yearlySoldes?: YearlySoldes; // Soldes mensuels par année
}

// Helper pour obtenir le type d'une catégorie avec fallback
export const getCategoryType = (category: Category): 'income' | 'expense' => {
  return category.type || 'expense'; // Défaut: expense pour compatibilité rétroactive
};
