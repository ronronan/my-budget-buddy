import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { type Livret, MONTH_NAMES, getSoldeEffectif } from '@/types/budget.types';

interface LivretTresorerieChartProps {
  livrets: Livret[];
  selectedYear: number;
}

export function LivretTresorerieChart({ livrets, selectedYear }: LivretTresorerieChartProps) {
  // Transformer les données pour Recharts
  const chartData = MONTH_NAMES.map((monthName, index) => {
    const month = index + 1;

    // Calculer la trésorerie totale pour ce mois (somme des soldes de tous les livrets)
    let tresorerie = 0;
    let hasData = false;

    for (const livret of livrets) {
      const solde = getSoldeEffectif(livret, selectedYear, month);
      if (solde !== null) {
        tresorerie += solde;
        hasData = true;
      }
    }

    return {
      month: monthName,
      tresorerie: hasData ? tresorerie : null, // null pour les mois sans données
    };
  });

  // Configuration du graphique
  const chartConfig = {
    tresorerie: {
      label: 'Trésorerie totale',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Calculer les statistiques
  const validData = chartData.filter((d) => d.tresorerie !== null);
  const hasSomeData = validData.length > 0;
  const minTresorerie = hasSomeData ? Math.min(...validData.map((d) => d.tresorerie!)) : 0;
  const maxTresorerie = hasSomeData ? Math.max(...validData.map((d) => d.tresorerie!)) : 0;
  const avgTresorerie = hasSomeData ? validData.reduce((sum, d) => sum + d.tresorerie!, 0) / validData.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution de la trésorerie {selectedYear}</CardTitle>
        <CardDescription>Somme des soldes de tous vos livrets par mois</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasSomeData ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <p className='text-sm text-muted-foreground'>Aucun solde enregistré pour {selectedYear}</p>
            <p className='mt-1 text-xs text-muted-foreground'>Commencez à saisir vos soldes mensuels ci-dessous</p>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div className='mb-4 grid grid-cols-3 gap-3'>
              <div className='rounded-lg border bg-card p-3'>
                <p className='text-xs text-muted-foreground'>Minimum</p>
                <p className='text-lg font-semibold'>{minTresorerie.toFixed(2)} €</p>
              </div>
              <div className='rounded-lg border bg-card p-3'>
                <p className='text-xs text-muted-foreground'>Moyenne</p>
                <p className='text-lg font-semibold'>{avgTresorerie.toFixed(2)} €</p>
              </div>
              <div className='rounded-lg border bg-card p-3'>
                <p className='text-xs text-muted-foreground'>Maximum</p>
                <p className='text-lg font-semibold'>{maxTresorerie.toFixed(2)} €</p>
              </div>
            </div>

            {/* Graphique */}
            <ChartContainer config={chartConfig} className='h-[300px] w-full'>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value.toFixed(0)}€`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(2)} €`} />} />
                <Line
                  type='monotone'
                  dataKey='tresorerie'
                  stroke='var(--color-tresorerie)'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
