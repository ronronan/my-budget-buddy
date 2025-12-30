import { useState } from 'react';
import { IconCalculator, IconDeviceFloppy } from '@tabler/icons-react';
import { toast } from 'sonner';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudget } from '@/hooks/useBudget';
import { MONTH_NAMES, type MonthlyBudget, createEmptyMonthlyBudget } from '@/types/budget.types';

export default function BudgetAnnuel() {
  const { categories, updateCategory, loading } = useBudget();
  const [editingBudgets, setEditingBudgets] = useState<Record<string, MonthlyBudget>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialiser les budgets à éditer
  const initializeBudget = (categoryId: string, currentBudget?: MonthlyBudget) => {
    if (!editingBudgets[categoryId]) {
      setEditingBudgets((prev) => ({
        ...prev,
        [categoryId]: currentBudget || createEmptyMonthlyBudget(),
      }));
    }
  };

  // Mettre à jour un montant mensuel
  const updateMonthlyBudget = (categoryId: string, month: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingBudgets((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || createEmptyMonthlyBudget()),
        [month]: numValue,
      },
    }));
    setHasChanges(true);
  };

  // Calculer le total annuel d'une catégorie
  const calculateYearlyTotal = (monthlyBudget?: MonthlyBudget): number => {
    if (!monthlyBudget) return 0;
    return Object.values(monthlyBudget).reduce((sum, amount) => sum + (amount || 0), 0);
  };

  // Calculer le total d'une catégorie parent (somme des enfants)
  const calculateParentTotal = (categoryId: string): number => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !category.subcategories.length) return 0;

    return category.subcategories.reduce((sum, subcat) => {
      const budget = editingBudgets[subcat.id] || subcat.monthlyBudgets;
      return sum + calculateYearlyTotal(budget);
    }, 0);
  };

  // Sauvegarder tous les changements
  const saveAllChanges = async () => {
    try {
      const updates = Object.entries(editingBudgets).map(([categoryId, monthlyBudgets]) =>
        updateCategory(categoryId, { monthlyBudgets }),
      );

      await Promise.all(updates);
      toast.success('Budgets mis à jour avec succès');
      setHasChanges(false);
      setEditingBudgets({});
    } catch (error) {
      console.error('Error saving budgets:', error);
      toast.error('Erreur lors de la sauvegarde des budgets');
    }
  };

  // Filtrer les catégories parents uniquement
  const parentCategories = categories.filter((cat) => !cat.parentId);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className='flex flex-1 items-center justify-center'>
          <p className='text-muted-foreground'>Chargement...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-3 py-3 px-3 md:gap-4 md:py-4 md:px-4 lg:gap-6 lg:py-6 lg:px-6'>
            {/* En-tête */}
            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>Budget Annuel</h1>
                  <p className='text-sm text-muted-foreground'>Configurez vos budgets mensuels pour l'année en cours</p>
                </div>
                {hasChanges && (
                  <Button onClick={saveAllChanges} size='sm'>
                    <IconDeviceFloppy className='mr-2 size-4' />
                    Sauvegarder
                  </Button>
                )}
              </div>
            </div>

            {/* Accordéon des catégories */}
            {parentCategories.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconCalculator className='mb-4 size-12 text-muted-foreground' />
                  <h3 className='mb-2 text-lg font-semibold'>Aucune catégorie</h3>
                  <p className='text-center text-sm text-muted-foreground'>
                    Créez des catégories dans les paramètres pour commencer à gérer votre budget
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type='single' collapsible className='space-y-3'>
                {parentCategories.map((category) => {
                  const parentTotal = calculateParentTotal(category.id);

                  return (
                    <AccordionItem key={category.id} value={category.id} className='rounded-lg border bg-card'>
                      <AccordionTrigger className='px-4 hover:no-underline'>
                        <div className='flex flex-1 items-center justify-between pr-4'>
                          <div className='flex items-center gap-3'>
                            {category.icon && <span className='text-xl'>{category.icon}</span>}
                            <div className='flex flex-col items-start'>
                              <span className='font-medium'>{category.name}</span>
                              <span className='text-xs text-muted-foreground'>{category.subcategories.length} sous-catégories</span>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span
                              className='rounded-full px-3 py-1 text-sm font-semibold'
                              style={{ backgroundColor: category.color + '20', color: category.color }}
                            >
                              {parentTotal.toFixed(2)} € / an
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className='px-4 pb-4'>
                        {category.subcategories.length === 0 ? (
                          <p className='py-4 text-center text-sm text-muted-foreground'>Aucune sous-catégorie</p>
                        ) : (
                          <div className='space-y-4'>
                            {category.subcategories.map((subcat) => {
                              initializeBudget(subcat.id, subcat.monthlyBudgets);
                              const currentBudget = editingBudgets[subcat.id] || subcat.monthlyBudgets || createEmptyMonthlyBudget();
                              const yearlyTotal = calculateYearlyTotal(currentBudget);

                              return (
                                <Card key={subcat.id}>
                                  <CardHeader className='pb-3'>
                                    <div className='flex items-center justify-between'>
                                      <div className='flex items-center gap-2'>
                                        {subcat.icon && <span>{subcat.icon}</span>}
                                        <CardTitle className='text-base'>{subcat.name}</CardTitle>
                                      </div>
                                      <span className='text-sm font-semibold text-muted-foreground'>{yearlyTotal.toFixed(2)} € / an</span>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
                                      {MONTH_NAMES.map((monthName, index) => {
                                        const monthNumber = index + 1;
                                        return (
                                          <div key={monthNumber} className='space-y-1'>
                                            <Label htmlFor={`${subcat.id}-${monthNumber}`} className='text-xs'>
                                              {monthName}
                                            </Label>
                                            <Input
                                              id={`${subcat.id}-${monthNumber}`}
                                              type='number'
                                              min='0'
                                              step='0.01'
                                              value={currentBudget[monthNumber] || 0}
                                              onChange={(e) => updateMonthlyBudget(subcat.id, monthNumber, e.target.value)}
                                              className='h-9'
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
