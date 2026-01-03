import { IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudget } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';
import { simpleTransactionSchema, splitTransactionSchema } from '@/lib/validation/transaction.schema';
import { type TransactionInput, type TransactionWithCategories } from '@/types/budget.types';

interface TransactionSheetProps {
  open: boolean;
  transaction?: TransactionWithCategories | null;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<void>;
}

type FormMode = 'simple' | 'split';

interface FormData {
  totalAmount: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  // Mode simple
  categoryId: string;
  // Mode splits
  splits: Array<{ categoryId: string; amount: string }>;
}

export function TransactionSheet({ open, transaction, onClose, onSubmit }: TransactionSheetProps) {
  const { categories } = useBudget();

  const [mode, setMode] = useState<FormMode>('simple');
  const [formData, setFormData] = useState<FormData>({
    totalAmount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    categoryId: '',
    splits: [],
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!transaction;

  // Filtrer uniquement les sous-catégories
  const subcategories = categories.flatMap((c) => c.subcategories);

  // Réinitialiser le formulaire quand le sheet s'ouvre/ferme ou que la transaction change
  useEffect(() => {
    if (open) {
      if (transaction) {
        // Mode édition
        const isSplit = transaction.splits.length > 1;
        setMode(isSplit ? 'split' : 'simple');
        setFormData({
          totalAmount: transaction.totalAmount.toString(),
          description: transaction.description,
          date: transaction.date.toISOString().split('T')[0],
          type: transaction.type,
          categoryId: isSplit ? '' : transaction.splits[0]?.categoryId || '',
          splits: isSplit
            ? transaction.splits.map((s) => ({
                categoryId: s.categoryId,
                amount: s.amount.toString(),
              }))
            : [],
        });
      } else {
        // Mode création
        setMode('simple');
        setFormData({
          totalAmount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          categoryId: '',
          splits: [],
        });
      }
      setErrors({});
    }
  }, [open, transaction]);

  // Calculer le montant restant à allouer en mode split
  const totalAllocated = mode === 'split' ? formData.splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) : 0;
  const totalAmount = parseFloat(formData.totalAmount) || 0;
  const remaining = totalAmount - totalAllocated;

  const handleAddSplit = () => {
    setFormData({
      ...formData,
      splits: [...formData.splits, { categoryId: '', amount: '' }],
    });
  };

  const handleRemoveSplit = (index: number) => {
    setFormData({
      ...formData,
      splits: formData.splits.filter((_, i) => i !== index),
    });
  };

  const handleSplitChange = (index: number, field: 'categoryId' | 'amount', value: string) => {
    const newSplits = [...formData.splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setFormData({ ...formData, splits: newSplits });
  };

  const handleModeChange = (newMode: FormMode) => {
    if (newMode === 'split' && mode === 'simple') {
      // Convertir mode simple vers split
      if (formData.categoryId && formData.totalAmount) {
        setFormData({
          ...formData,
          splits: [
            {
              categoryId: formData.categoryId,
              amount: formData.totalAmount,
            },
          ],
        });
      }
    } else if (newMode === 'simple' && mode === 'split') {
      // Convertir mode split vers simple
      if (formData.splits.length > 0) {
        setFormData({
          ...formData,
          categoryId: formData.splits[0].categoryId,
          totalAmount: formData.splits[0].amount,
        });
      }
    }
    setMode(newMode);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      let transactionInput: TransactionInput;

      if (mode === 'simple') {
        // Validation mode simple
        const simpleData = {
          totalAmount: parseFloat(formData.totalAmount),
          categoryId: formData.categoryId,
          description: formData.description,
          date: new Date(formData.date),
          type: formData.type,
        };

        const result = simpleTransactionSchema.safeParse(simpleData);
        if (!result.success) {
          const fieldErrors: Partial<Record<string, string>> = {};
          result.error.issues.forEach((err) => {
            const field = err.path[0] as string;
            fieldErrors[field] = err.message;
          });
          setErrors(fieldErrors);
          return;
        }

        // Convertir en TransactionInput
        transactionInput = {
          totalAmount: result.data.totalAmount,
          description: result.data.description,
          date: result.data.date,
          type: result.data.type,
          splits: [
            {
              categoryId: result.data.categoryId,
              amount: result.data.totalAmount,
            },
          ],
        };
      } else {
        // Validation mode split
        const splitData = {
          totalAmount: parseFloat(formData.totalAmount),
          splits: formData.splits.map((s) => ({
            categoryId: s.categoryId,
            amount: parseFloat(s.amount),
          })),
          description: formData.description,
          date: new Date(formData.date),
          type: formData.type,
        };

        const result = splitTransactionSchema.safeParse(splitData);
        if (!result.success) {
          const fieldErrors: Partial<Record<string, string>> = {};
          result.error.issues.forEach((err) => {
            const field = err.path[0] as string;
            fieldErrors[field] = err.message;
          });
          setErrors(fieldErrors);
          return;
        }

        transactionInput = {
          totalAmount: result.data.totalAmount,
          description: result.data.description,
          date: result.data.date,
          type: result.data.type,
          splits: result.data.splits,
        };
      }

      setIsSubmitting(true);
      await onSubmit(transactionInput);
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
        <SheetHeader className='pb-4'>
          <SheetTitle>{isEditing ? 'Modifier la transaction' : 'Nouvelle transaction'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Modifiez les informations de la transaction.' : 'Créez une nouvelle transaction de revenu ou dépense.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='space-y-6 py-6'>
          {/* Type de transaction */}
          <div className='space-y-2.5'>
            <Label className='text-sm font-medium'>Type de transaction</Label>
            <Tabs value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='expense'>Dépense</TabsTrigger>
                <TabsTrigger value='income'>Revenu</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Description */}
          <div className='space-y-2.5'>
            <Label htmlFor='description' className='text-sm font-medium'>
              Description <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder='Ex: Courses du mois'
              disabled={isSubmitting}
              className='h-11'
            />
            {errors.description && <p className='text-sm text-destructive'>{errors.description}</p>}
          </div>

          {/* Date */}
          <div className='space-y-2.5'>
            <Label htmlFor='date' className='text-sm font-medium'>
              Date <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='date'
              type='date'
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={isSubmitting}
              className='h-11'
            />
            {errors.date && <p className='text-sm text-destructive'>{errors.date}</p>}
          </div>

          {/* Mode simple/split */}
          <div className='space-y-2.5'>
            <Label className='text-sm font-medium'>Répartition</Label>
            <Tabs value={mode} onValueChange={(value) => handleModeChange(value as FormMode)}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='simple'>Simple</TabsTrigger>
                <TabsTrigger value='split'>Diviser</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Mode SIMPLE */}
          {mode === 'simple' && (
            <>
              {/* Montant */}
              <div className='space-y-2.5'>
                <Label htmlFor='totalAmount' className='text-sm font-medium'>
                  Montant (€) <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='totalAmount'
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder='0.00'
                  disabled={isSubmitting}
                  className='h-11'
                />
                {errors.totalAmount && <p className='text-sm text-destructive'>{errors.totalAmount}</p>}
              </div>

              {/* Catégorie */}
              <div className='space-y-2.5'>
                <Label htmlFor='categoryId' className='text-sm font-medium'>
                  Catégorie <span className='text-destructive'>*</span>
                </Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger id='categoryId' disabled={isSubmitting} className='h-11'>
                    <SelectValue placeholder='Sélectionner une catégorie' />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.length === 0 ? (
                      <div className='p-2 text-sm text-muted-foreground'>Aucune sous-catégorie disponible</div>
                    ) : (
                      categories.map((parent) => (
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
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className='text-sm text-destructive'>{errors.categoryId}</p>}
              </div>
            </>
          )}

          {/* Mode SPLIT */}
          {mode === 'split' && (
            <>
              {/* Montant total */}
              <div className='space-y-2.5'>
                <Label htmlFor='totalAmount' className='text-sm font-medium'>
                  Montant total (€) <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='totalAmount'
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder='0.00'
                  disabled={isSubmitting}
                  className='h-11'
                />
                {errors.totalAmount && <p className='text-sm text-destructive'>{errors.totalAmount}</p>}
              </div>

              {/* Liste des splits */}
              <div className='space-y-2.5'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>Répartition par catégorie</Label>
                  <Button type='button' variant='outline' size='sm' onClick={handleAddSplit} disabled={isSubmitting}>
                    <IconPlus className='mr-1 size-4' />
                    Ajouter
                  </Button>
                </div>

                {formData.splits.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>Cliquez sur "Ajouter" pour répartir le montant entre plusieurs catégories</p>
                ) : (
                  <div className='space-y-3'>
                    {formData.splits.map((split, index) => (
                      <div key={index} className='flex gap-2 rounded-lg border p-3'>
                        <div className='flex-1 space-y-2'>
                          <Select
                            value={split.categoryId}
                            onValueChange={(value) => handleSplitChange(index, 'categoryId', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className='h-10'>
                              <SelectValue placeholder='Catégorie' />
                            </SelectTrigger>
                            <SelectContent>
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
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            value={split.amount}
                            onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                            placeholder='Montant (€)'
                            disabled={isSubmitting}
                            className='h-10'
                          />
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => handleRemoveSplit(index)}
                          disabled={isSubmitting}
                          className='shrink-0'
                        >
                          <IconX className='size-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Montant restant */}
                {formData.splits.length > 0 && totalAmount > 0 && (
                  <div
                    className={cn(
                      'rounded-md border p-3 text-sm font-medium',
                      remaining > 0.01 &&
                        'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-400',
                      remaining < -0.01 && 'border-destructive bg-destructive/10 text-destructive',
                      Math.abs(remaining) <= 0.01 &&
                        'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400',
                    )}
                  >
                    {Math.abs(remaining) <= 0.01 ? (
                      <span>✓ Montant entièrement réparti</span>
                    ) : remaining > 0 ? (
                      <span>Restant à allouer : {remaining.toFixed(2)} €</span>
                    ) : (
                      <span>Dépassement : {Math.abs(remaining).toFixed(2)} €</span>
                    )}
                  </div>
                )}

                {errors.splits && <p className='text-sm text-destructive'>{errors.splits}</p>}
              </div>
            </>
          )}

          <SheetFooter className='gap-3 pt-6 sm:gap-2'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting} className='h-11'>
              Annuler
            </Button>
            <Button type='submit' disabled={isSubmitting} className='h-11'>
              {isSubmitting ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
