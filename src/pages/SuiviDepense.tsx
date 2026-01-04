import { IconPlus, IconShoppingCart, IconTrendingDown, IconTrendingUp, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

import { ImportDialog } from '@/components/import/ImportDialog';
import { SiteHeader } from '@/components/site-header';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionSheet } from '@/components/transactions/TransactionSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/hooks/useBudget';
import { type TransactionInput, type TransactionWithCategories } from '@/types/budget.types';

export default function Page() {
  const { transactions, transactionsLoading, createTransaction, updateTransaction, deleteTransaction } = useBudget();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategories | null>(null);

  // Calculer les vraies statistiques du mois en cours
  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
  });

  const stats = {
    totalDepenses: currentMonthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0),
    totalRevenus: currentMonthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.totalAmount, 0),
    solde: 0,
  };
  stats.solde = stats.totalRevenus - stats.totalDepenses;

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
                  <p className='text-xs text-muted-foreground'>Ce mois-ci</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Revenus totaux</CardTitle>
                  <IconTrendingUp className='size-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalRevenus.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>Ce mois-ci</p>
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
                <TransactionList
                  transactions={transactions}
                  loading={transactionsLoading}
                  onEdit={handleEdit}
                  onDelete={deleteTransaction}
                />
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
