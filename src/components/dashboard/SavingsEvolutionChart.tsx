import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MONTH_NAMES, type TransactionWithCategories } from '@/types/budget.types';

interface SavingsEvolutionChartProps {
  transactions: TransactionWithCategories[];
  selectedYear: number;
}

export function SavingsEvolutionChart({ transactions, selectedYear }: SavingsEvolutionChartProps) {
  // Calculer l'épargne mensuelle (Revenus - Dépenses)
  const chartData = useMemo(() => {
    return MONTH_NAMES.map((monthName, index) => {
      const month = index + 1;

      // Filtrer transactions du mois
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === month;
      });

      // Calculer revenus et dépenses du mois
      const monthIncome = monthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.totalAmount, 0);

      const monthExpenses = monthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.totalAmount, 0);

      const savings = monthIncome - monthExpenses;

      return {
        month: monthName,
        epargne: savings,
        revenus: monthIncome,
        depenses: monthExpenses,
      };
    });
  }, [transactions]);

  // Configuration du graphique
  const chartConfig = {
    epargne: {
      label: 'Épargne',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Statistiques
  const totalSavings = chartData.reduce((sum, m) => sum + m.epargne, 0);
  const avgMonthlySavings = totalSavings / 12;
  const maxSavings = Math.max(...chartData.map((m) => m.epargne));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution de l'épargne {selectedYear}</CardTitle>
        <CardDescription>Différence mensuelle entre vos revenus et vos dépenses</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Statistiques */}
        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div className='rounded-lg border bg-card p-3'>
            <p className='text-xs text-muted-foreground'>Total annuel</p>
            <p className={`text-lg font-semibold ${totalSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalSavings >= 0 ? '+' : ''}
              {totalSavings.toFixed(2)} €
            </p>
          </div>
          <div className='rounded-lg border bg-card p-3'>
            <p className='text-xs text-muted-foreground'>Moyenne mensuelle</p>
            <p className={`text-lg font-semibold ${avgMonthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgMonthlySavings >= 0 ? '+' : ''}
              {avgMonthlySavings.toFixed(2)} €
            </p>
          </div>
          <div className='rounded-lg border bg-card p-3'>
            <p className='text-xs text-muted-foreground'>Meilleur mois</p>
            <p className='text-lg font-semibold text-green-600'>+{maxSavings.toFixed(2)} €</p>
          </div>
        </div>

        {/* Graphique */}
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value.toFixed(0)}€`} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const labels = {
                      epargne: 'Épargne',
                      revenus: 'Revenus',
                      depenses: 'Dépenses',
                    };
                    return `${labels[name as keyof typeof labels] || name}: ${Number(value).toFixed(2)} €`;
                  }}
                />
              }
            />
            {/* Ligne de référence à 0 */}
            <ReferenceLine y={0} stroke='#gray' strokeDasharray='3 3' />
            <Line type='monotone' dataKey='epargne' stroke='#10b981' strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
