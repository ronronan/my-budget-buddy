import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { type CategoryWithSubcategories, type TransactionWithCategories } from '@/types/budget.types';

interface ExpensesByCategoryChartProps {
  transactions: TransactionWithCategories[];
  categories: CategoryWithSubcategories[];
  selectedYear: number;
}

export function ExpensesByCategoryChart({ transactions, categories, selectedYear }: ExpensesByCategoryChartProps) {
  // Agréger dépenses par catégorie parent
  const chartData = useMemo(() => {
    // Filtrer uniquement les dépenses
    const expenses = transactions.filter((t) => t.type === 'expense');

    // Map pour accumuler par catégorie parent
    const categoryTotals = new Map<string, { name: string; total: number; color: string }>();

    expenses.forEach((transaction) => {
      transaction.splits.forEach((split) => {
        // Trouver la catégorie (parent ou sous-catégorie)
        let parentCategory: CategoryWithSubcategories | undefined;

        for (const cat of categories) {
          const sub = cat.subcategories.find((s) => s.id === split.categoryId);
          if (sub) {
            parentCategory = cat;
            break;
          }
        }

        // Si pas trouvé dans les sous-catégories, c'est peut-être un parent
        if (!parentCategory) {
          parentCategory = categories.find((c) => c.id === split.categoryId);
        }

        if (parentCategory) {
          const existing = categoryTotals.get(parentCategory.id) || {
            name: parentCategory.name,
            total: 0,
            color: parentCategory.color,
          };
          existing.total += split.amount;
          categoryTotals.set(parentCategory.id, existing);
        }
      });
    });

    // Convertir en array et trier par montant décroissant
    return Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .map((cat) => ({
        category: cat.name,
        montant: cat.total,
        fill: cat.color,
      }));
  }, [transactions, categories]);

  // Configuration du graphique
  const chartConfig = {
    montant: {
      label: 'Montant',
      color: 'hsl(var(--chart-1))',
    },
  };

  const totalExpenses = chartData.reduce((sum, cat) => sum + cat.montant, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dépenses par catégorie {selectedYear}</CardTitle>
        <CardDescription>Répartition des {totalExpenses.toFixed(2)} € de dépenses totales</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <p className='text-sm text-muted-foreground'>Aucune dépense enregistrée pour {selectedYear}</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className='h-[400px] w-full'>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='category' tickLine={false} axisLine={false} angle={-45} textAnchor='end' height={100} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(0)}€`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(2)} €`} />} />
              <Bar dataKey='montant' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
