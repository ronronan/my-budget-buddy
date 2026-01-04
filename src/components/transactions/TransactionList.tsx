import { IconArrowDown, IconArrowUp, IconCalendar, IconDotsVertical, IconEdit, IconFilter, IconTrash } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { createElement, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBudget } from '@/hooks/useBudget';
import { getIconComponent } from '@/lib/iconMap';
import { cn } from '@/lib/utils';
import { type TransactionWithCategories } from '@/types/budget.types';

interface TransactionListProps {
  transactions: TransactionWithCategories[];
  loading: boolean;
  onEdit: (transaction: TransactionWithCategories) => void;
  onDelete: (id: string) => void;
  selectedYear: number;
  selectedMonth: number;
}

export function TransactionList({ transactions, loading, onEdit, onDelete, selectedYear, selectedMonth }: TransactionListProps) {
  const { categories, updateTransaction } = useBudget();
  const isMobile = useIsMobile();

  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionWithCategories | null>(null);
  const [updatingTransactionId, setUpdatingTransactionId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Filtrage des transactions avec memoization
  const filtered = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);

        // Filtre mois/année (obligatoire)
        if (date.getMonth() + 1 !== selectedMonth || date.getFullYear() !== selectedYear) {
          return false;
        }

        // Filtre par type (optionnel)
        if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;

        // Filtre par catégorie (optionnel)
        if (categoryFilter !== 'all' && !transaction.splits.some((s) => s.categoryId === categoryFilter)) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear, selectedMonth, typeFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // Calculer la page effective à afficher (reset à 1 si dépassement)
  const effectivePage = currentPage > totalPages && totalPages > 0 ? 1 : currentPage;

  const paginatedTransactions = useMemo(() => {
    const startIndex = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, effectivePage]);

  // Handler pour changement de page qui gère le reset si nécessaire
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  const handleCategoryChange = async (transactionId: string, newCategoryId: string, currentAmount: number) => {
    try {
      setUpdatingTransactionId(transactionId);

      await updateTransaction(transactionId, {
        splits: [{ categoryId: newCategoryId, amount: currentAmount }],
      });

      toast.success('Catégorie modifiée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification de la catégorie');
      console.error(error);
    } finally {
      setUpdatingTransactionId(null);
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
        <>
          <div className='space-y-2'>
            {paginatedTransactions.map((transaction) => (
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
                    {transaction.splits.length === 1 ? (
                      // Transaction simple : Select modifiable
                      <Select
                        value={transaction.splits[0].categoryId}
                        onValueChange={(newCategoryId) => handleCategoryChange(transaction.id, newCategoryId, transaction.totalAmount)}
                        disabled={updatingTransactionId === transaction.id}
                      >
                        <SelectTrigger
                          className='h-auto min-h-[28px] w-auto border-0 px-2 py-1'
                          style={{
                            backgroundColor: transaction.categoriesDetails[0].categoryColor + '20',
                            color: transaction.categoriesDetails[0].categoryColor,
                          }}
                        >
                          <SelectValue>
                            <div className='flex items-center gap-1.5 text-xs font-medium'>
                              {transaction.categoriesDetails[0].categoryIcon && (
                                <span className='flex size-3.5 items-center justify-center'>
                                  {createElement(getIconComponent(transaction.categoriesDetails[0].categoryIcon), {
                                    className: 'size-3.5',
                                  })}
                                </span>
                              )}
                              <span>{transaction.categoriesDetails[0].categoryName}</span>
                              {updatingTransactionId === transaction.id && <Loader2 className='ml-1 size-3 animate-spin' />}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((parent) => (
                            <div key={parent.id}>
                              <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>{parent.name}</div>
                              {parent.subcategories.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  <div className='flex items-center gap-2'>
                                    <div className='size-3 rounded-full' style={{ backgroundColor: sub.color }} />
                                    {sub.icon && (
                                      <span className='flex size-3.5 items-center justify-center'>
                                        {createElement(getIconComponent(sub.icon), { className: 'size-3.5' })}
                                      </span>
                                    )}
                                    {sub.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      // Transaction split : Badges non modifiables
                      <>
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
                            <span>• {cat.amount.toFixed(2)} €</span>
                          </div>
                        ))}
                      </>
                    )}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={effectivePage} totalPages={totalPages} onPageChange={handlePageChange} showPageNumbers={!isMobile} />
          )}
        </>
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
