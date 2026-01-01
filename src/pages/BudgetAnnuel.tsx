import { IconCalculator, IconCopy, IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { SiteHeader } from '@/components/site-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudget } from '@/hooks/useBudget';
import { getIconComponent } from '@/lib/iconMap';
import {
  type Category,
  type CategoryWithSubcategories,
  MONTH_NAMES,
  type MonthlyBudget,
  createEmptyMonthlyBudget,
  getBudgetForYear,
  updateBudgetForYear,
} from '@/types/budget.types';

export default function BudgetAnnuel() {
  const { categories, updateCategory, loading } = useBudget();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [editingBudgets, setEditingBudgets] = useState<Record<string, MonthlyBudget>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Générer une liste d'années (année courante - 2 à année courante + 5)
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

  // Initialiser les budgets à éditer pour l'année sélectionnée
  const initializeBudget = (categoryId: string) => {
    if (!editingBudgets[categoryId]) {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        const budgetForYear = getBudgetForYear(category, selectedYear);
        setEditingBudgets((prev) => ({
          ...prev,
          [categoryId]: budgetForYear,
        }));
      }
    }
  };

  // Mettre à jour un montant mensuel
  const updateMonthlyBudget = (categoryId: string, month: number, value: string) => {
    // Gérer la valeur vide ou invalide
    const numValue = value === '' ? 0 : parseFloat(value);
    const finalValue = isNaN(numValue) ? 0 : Math.round(numValue * 100) / 100; // Limiter à 2 décimales

    setEditingBudgets((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || createEmptyMonthlyBudget()),
        [month]: finalValue,
      },
    }));
    setHasChanges(true);
  };

  // Remplir automatiquement tous les mois à 0 avec la valeur d'un mois de référence
  const fillFromReferenceMonth = (categoryId: string, referenceMonth: number) => {
    const currentBudget = editingBudgets[categoryId] || createEmptyMonthlyBudget();
    const referenceValue = currentBudget[referenceMonth] || 0;

    if (referenceValue === 0) {
      toast.error('Le mois de référence doit avoir une valeur non nulle');
      return;
    }

    const updatedBudget = { ...currentBudget };
    let filledCount = 0;

    // Remplir tous les mois à 0 avec la valeur de référence
    for (let month = 1; month <= 12; month++) {
      if (updatedBudget[month] === 0) {
        updatedBudget[month] = referenceValue;
        filledCount++;
      }
    }

    if (filledCount === 0) {
      toast.info('Tous les mois ont déjà une valeur');
      return;
    }

    setEditingBudgets((prev) => ({
      ...prev,
      [categoryId]: updatedBudget,
    }));
    setHasChanges(true);
    toast.success(`${filledCount} mois remplis avec ${referenceValue.toFixed(2)} €`);
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
      const budget = editingBudgets[subcat.id] || getBudgetForYear(subcat, selectedYear);
      return sum + calculateYearlyTotal(budget);
    }, 0);
  };

  // Calculer le budget moyen mensuel
  const calculateMonthlyAverage = (yearlyTotal: number): number => {
    return yearlyTotal / 12;
  };

  // Sauvegarder tous les changements
  const saveAllChanges = async () => {
    try {
      const updates = Object.entries(editingBudgets).map(([categoryId, monthlyBudgets]) => {
        // Chercher la catégorie dans les parents et les sous-catégories
        let category: CategoryWithSubcategories | Category | undefined = categories.find((c) => c.id === categoryId);
        if (!category) {
          // Si pas trouvé dans les parents, chercher dans les sous-catégories
          for (const parent of categories) {
            const subcategory = parent.subcategories.find((sub) => sub.id === categoryId);
            if (subcategory) {
              category = subcategory;
              break;
            }
          }
        }

        if (!category) return Promise.resolve();

        // Mettre à jour yearlyBudgets avec le budget de l'année sélectionnée
        const yearlyBudgets = updateBudgetForYear(category, selectedYear, monthlyBudgets);
        return updateCategory(categoryId, { yearlyBudgets });
      });

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
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>Budget Annuel</h1>
                  <p className='text-sm text-muted-foreground'>Configurez vos budgets mensuels par année</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => {
                      setSelectedYear(parseInt(value));
                      setEditingBudgets({}); // Réinitialiser les budgets en édition
                      setHasChanges(false);
                    }}
                  >
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
                  {hasChanges && (
                    <Button onClick={saveAllChanges} size='sm'>
                      <IconDeviceFloppy className='mr-2 size-4' />
                      Sauvegarder
                    </Button>
                  )}
                </div>
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
                  const CategoryIcon = getIconComponent(category.icon);

                  return (
                    <AccordionItem key={category.id} value={category.id} className='rounded-lg border bg-card'>
                      <AccordionTrigger className='px-4 hover:no-underline'>
                        <div className='flex flex-1 items-center justify-between pr-4'>
                          <div className='flex items-center gap-3'>
                            <CategoryIcon className='size-6' style={{ color: category.color }} />
                            <div className='flex flex-col items-start'>
                              <span className='font-medium'>{category.name}</span>
                              <span className='text-xs text-muted-foreground'>{category.subcategories.length} sous-catégories</span>
                            </div>
                          </div>
                          <div className='flex flex-col items-end gap-1'>
                            <span
                              className='rounded-full px-3 py-1 text-sm font-semibold'
                              style={{ backgroundColor: category.color + '20', color: category.color }}
                            >
                              {parentTotal.toFixed(2)} € / an
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {calculateMonthlyAverage(parentTotal).toFixed(2)} € / mois
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
                              initializeBudget(subcat.id);
                              const currentBudget = editingBudgets[subcat.id] || getBudgetForYear(subcat, selectedYear);
                              const yearlyTotal = calculateYearlyTotal(currentBudget);
                              const SubcatIcon = getIconComponent(subcat.icon);

                              return (
                                <Card key={subcat.id}>
                                  <CardHeader className='pb-3'>
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                                      <div className='flex items-center gap-2'>
                                        <SubcatIcon className='size-5' style={{ color: subcat.color }} />
                                        <CardTitle className='text-base'>{subcat.name}</CardTitle>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        <div className='flex flex-col items-end'>
                                          <span className='text-sm font-semibold text-muted-foreground'>
                                            {yearlyTotal.toFixed(2)} € / an
                                          </span>
                                          <span className='text-xs text-muted-foreground'>
                                            {calculateMonthlyAverage(yearlyTotal).toFixed(2)} € / mois
                                          </span>
                                        </div>
                                        <Select onValueChange={(value) => fillFromReferenceMonth(subcat.id, parseInt(value))}>
                                          <SelectTrigger className='h-8 w-auto gap-1 text-xs'>
                                            <IconCopy className='size-3.5' />
                                            <span className='hidden sm:inline'>Remplir depuis</span>
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MONTH_NAMES.map((monthName, index) => (
                                              <SelectItem key={index + 1} value={(index + 1).toString()}>
                                                {monthName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
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
                                              inputMode='decimal'
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
