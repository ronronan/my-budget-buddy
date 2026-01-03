import { IconArrowDown, IconArrowUp, IconCalendar, IconDotsVertical, IconEdit, IconFilter, IconTrash } from '@tabler/icons-react';
import { createElement, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudget } from '@/hooks/useBudget';
import { getIconComponent } from '@/lib/iconMap';
import { cn } from '@/lib/utils';
import { type TransactionWithCategories } from '@/types/budget.types';

interface TransactionListProps {
  transactions: TransactionWithCategories[];
  loading: boolean;
  onEdit: (transaction: TransactionWithCategories) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, loading, onEdit, onDelete }: TransactionListProps) {
  const { categories } = useBudget();

  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'month' | 'year' | 'all'>('month');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionWithCategories | null>(null);

  // Filtrage des transactions
  const filtered = transactions.filter((transaction) => {
    // Filtre par type
    if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;

    // Filtre par catégorie
    if (categoryFilter !== 'all' && !transaction.splits.some((s) => s.categoryId === categoryFilter)) return false;

    // Filtre par période
    const now = new Date();
    const transactionDate = new Date(transaction.date);

    if (periodFilter === 'month') {
      if (transactionDate.getMonth() !== now.getMonth() || transactionDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    } else if (periodFilter === 'year') {
      if (transactionDate.getFullYear() !== now.getFullYear()) {
        return false;
      }
    }

    return true;
  });

  const handleDeleteClick = (transaction: TransactionWithCategories) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingTransaction) {
      onDelete(deletingTransaction.id);
      setDeleteDialogOpen(false);
      setDeletingTransaction(null);
    }
  };

  // Format de date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-12 w-full' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Filtres */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <IconFilter className='size-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Filtres:</span>
        </div>

        {/* Filtre type */}
        <Select value={typeFilter} onValueChange={(value: 'all' | 'income' | 'expense') => setTypeFilter(value)}>
          <SelectTrigger className='h-9 w-[140px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tous les types</SelectItem>
            <SelectItem value='expense'>Dépenses</SelectItem>
            <SelectItem value='income'>Revenus</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtre catégorie */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='h-9 w-[180px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Toutes les catégories</SelectItem>
            {categories.map((parent) => (
              <div key={parent.id}>
                <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>{parent.name}</div>
                {parent.subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    <div className='flex items-center gap-2'>
                      <div className='size-3 rounded-full' style={{ backgroundColor: sub.color }} />
                      {sub.name}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre période */}
        <Select value={periodFilter} onValueChange={(value: 'month' | 'year' | 'all') => setPeriodFilter(value)}>
          <SelectTrigger className='h-9 w-[140px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='month'>Ce mois</SelectItem>
            <SelectItem value='year'>Cette année</SelectItem>
            <SelectItem value='all'>Tout</SelectItem>
          </SelectContent>
        </Select>

        {/* Nombre de résultats */}
        <span className='ml-auto text-sm text-muted-foreground'>
          {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste des transactions */}
      {filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <IconCalendar className='mb-4 size-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>Aucune transaction</h3>
          <p className='text-sm text-muted-foreground'>
            {transactions.length === 0
              ? 'Commencez par créer votre première transaction'
              : 'Aucune transaction ne correspond aux filtres sélectionnés'}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {filtered.map((transaction) => (
            <div key={transaction.id} className='flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent'>
              {/* Icône type */}
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  transaction.type === 'income' ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950',
                )}
              >
                {transaction.type === 'income' ? (
                  <IconArrowUp className='size-5 text-green-600 dark:text-green-400' />
                ) : (
                  <IconArrowDown className='size-5 text-red-600 dark:text-red-400' />
                )}
              </div>

              {/* Contenu */}
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <p className='font-medium'>{transaction.description}</p>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className='shrink-0'>
                    {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                  </Badge>
                </div>

                <div className='mb-2 flex items-center gap-2 text-sm text-muted-foreground'>
                  <IconCalendar className='size-3.5' />
                  <span>{formatDate(transaction.date)}</span>
                </div>

                {/* Catégories */}
                <div className='flex flex-wrap gap-1.5'>
                  {transaction.categoriesDetails.map((cat) => (
                    <div
                      key={cat.categoryId}
                      className='flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium'
                      style={{
                        backgroundColor: cat.categoryColor + '20',
                        color: cat.categoryColor,
                      }}
                    >
                      {cat.categoryIcon && (
                        <span className='flex size-3.5 items-center justify-center'>
                          {createElement(getIconComponent(cat.categoryIcon), { className: 'size-3.5' })}
                        </span>
                      )}
                      <span>{cat.categoryName}</span>
                      {transaction.splits.length > 1 && <span>• {cat.amount.toFixed(2)} €</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Montant et actions */}
              <div className='flex shrink-0 items-center gap-3'>
                <span
                  className={cn(
                    'text-lg font-bold',
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.totalAmount.toFixed(2)} €
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='size-8'>
                      <IconDotsVertical className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <IconEdit className='mr-2 size-4' />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(transaction)} className='text-destructive'>
                      <IconTrash className='mr-2 size-4' />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la transaction "{deletingTransaction?.description}" ?<br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
