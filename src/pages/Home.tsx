import { useState } from 'react';

import { ExpensesByCategoryChart } from '@/components/dashboard/ExpensesByCategoryChart';
import { IncomeVsExpensesSummary } from '@/components/dashboard/IncomeVsExpensesSummary';
import { SavingsEvolutionChart } from '@/components/dashboard/SavingsEvolutionChart';
import { SiteHeader } from '@/components/site-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudget } from '@/hooks/useBudget';

export default function Page() {
  const { transactions, categories, transactionsLoading } = useBudget();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Générer options d'années (currentYear - 2 à currentYear + 1)
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);

  // Filtrer transactions par année sélectionnée (React Compiler optimise automatiquement)
  const yearTransactions = transactions.filter((t) => {
    const transactionYear = new Date(t.date).getFullYear();
    return transactionYear === selectedYear;
  });

  // Calculer statistiques annuelles (React Compiler optimise automatiquement)
  const totalExpenses = yearTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalIncome = yearTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.totalAmount, 0);
  const yearStats = {
    totalExpenses,
    totalIncome,
    balance: totalIncome - totalExpenses,
  };

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-3 py-3 px-3 md:gap-4 md:py-4 md:px-4 lg:gap-6 lg:py-6 lg:px-6'>
            {/* En-tête avec sélecteur d'année */}
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>Tableau de bord</h1>
                <p className='text-sm text-muted-foreground'>Vue d'ensemble de votre budget pour {selectedYear}</p>
              </div>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {transactionsLoading ? (
              <div className='flex items-center justify-center py-12'>
                <p className='text-sm text-muted-foreground'>Chargement des données...</p>
              </div>
            ) : (
              <>
                {/* 1. Synthèse Revenus vs Dépenses */}
                <IncomeVsExpensesSummary
                  totalIncome={yearStats.totalIncome}
                  totalExpenses={yearStats.totalExpenses}
                  balance={yearStats.balance}
                />

                {/* 2. Dépenses par catégorie (sur l'année) */}
                <ExpensesByCategoryChart transactions={yearTransactions} categories={categories} selectedYear={selectedYear} />

                {/* 3. Évolution de l'épargne (mensuelle) */}
                <SavingsEvolutionChart transactions={yearTransactions} selectedYear={selectedYear} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
