import { IconPlus, IconShoppingCart, IconTrendingDown, IconTrendingUp, IconUpload } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ImportDialog } from '@/components/import/ImportDialog';
import { SiteHeader } from '@/components/site-header';
import { MonthTabs } from '@/components/transactions/MonthTabs';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionSheet } from '@/components/transactions/TransactionSheet';
import { YearNavigator } from '@/components/transactions/YearNavigator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/hooks/useBudget';
import { MONTH_NAMES, type TransactionInput, type TransactionWithCategories } from '@/types/budget.types';

export default function Page() {
  const { transactions, transactionsLoading, createTransaction, updateTransaction, deleteTransaction } = useBudget();

  const [searchParams, setSearchParams] = useSearchParams();

  // Memoize now pour éviter de recréer l'objet à chaque render
  const now = useMemo(() => new Date(), []);

  // États de navigation mois/année avec initialisation depuis URL
  const [selectedYear, setSelectedYear] = useState(() => {
    const yearParam = searchParams.get('year');
    return yearParam ? parseInt(yearParam) : now.getFullYear();
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const monthParam = searchParams.get('month');
    return monthParam ? parseInt(monthParam) : now.getMonth() + 1;
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategories | null>(null);

  // Synchronisation URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('year', String(selectedYear));
    params.set('month', String(selectedMonth));
    setSearchParams(params, { replace: true });
  }, [selectedYear, selectedMonth, setSearchParams]);

  // Calcul de la plage d'années
  const { minYear, maxYear } = useMemo(() => {
    if (transactions.length === 0) {
      return { minYear: now.getFullYear(), maxYear: now.getFullYear() };
    }
    const years = transactions.map((t) => new Date(t.date).getFullYear());
    return {
      minYear: Math.min(...years),
      maxYear: now.getFullYear(),
    };
  }, [transactions, now]);

  // Calculer les statistiques pour le mois sélectionné
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === selectedMonth && transactionDate.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const totalDepenses = currentMonthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalRevenus = currentMonthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.totalAmount, 0);
    return {
      totalDepenses,
      totalRevenus,
      solde: totalRevenus - totalDepenses,
    };
  }, [currentMonthTransactions]);

  // Label de période pour les cartes de stats
  const periodLabel =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1
      ? 'Ce mois-ci'
      : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  const handleCreate = () => {
    setEditingTransaction(null);
    setSheetOpen(true);
  };

  const handleEdit = (transaction: TransactionWithCategories) => {
    setEditingTransaction(transaction);
    setSheetOpen(true);
  };

  const handleSubmit = async (data: TransactionInput) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
    setSheetOpen(false);
  };

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-3 py-3 px-3 md:gap-4 md:py-4 md:px-4 lg:gap-6 lg:py-6 lg:px-6'>
            <div className='flex items-center justify-end gap-2'>
              <Button variant='outline' onClick={() => setImportDialogOpen(true)} className='w-full sm:w-auto'>
                <IconUpload className='mr-2 size-4' />
                Importer CSV
              </Button>
              <Button onClick={handleCreate} className='w-full sm:w-auto'>
                <IconPlus className='mr-2 size-4' />
                Nouvelle transaction
              </Button>
            </div>

            {/* Cartes de statistiques */}
            <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Dépenses totales</CardTitle>
                  <IconTrendingDown className='size-4 text-red-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalDepenses.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>{periodLabel}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Revenus totaux</CardTitle>
                  <IconTrendingUp className='size-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalRevenus.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>{periodLabel}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Solde</CardTitle>
                  <IconShoppingCart className='size-4 text-primary' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.solde.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>Différence revenus/dépenses</p>
                </CardContent>
              </Card>
            </div>

            {/* Dernières transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Historique de vos dépenses et revenus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {/* Navigation année */}
                  <YearNavigator selectedYear={selectedYear} onYearChange={setSelectedYear} minYear={minYear} maxYear={maxYear} />

                  {/* Tabs mois */}
                  <MonthTabs selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={setSelectedMonth} />

                  {/* Liste avec filtres et pagination */}
                  <TransactionList
                    transactions={transactions}
                    loading={transactionsLoading}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    onEdit={handleEdit}
                    onDelete={deleteTransaction}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sheet formulaire */}
      <TransactionSheet open={sheetOpen} transaction={editingTransaction} onClose={() => setSheetOpen(false)} onSubmit={handleSubmit} />

      {/* Dialog import CSV */}
      <ImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />
    </>
  );
}
