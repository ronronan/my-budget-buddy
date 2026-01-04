import { IconTrendingDown, IconTrendingUp, IconWallet } from '@tabler/icons-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncomeVsExpensesSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function IncomeVsExpensesSummary({ totalIncome, totalExpenses, balance }: IncomeVsExpensesSummaryProps) {
  // Calculer pourcentages
  const total = totalIncome + totalExpenses;
  const incomePercent = total > 0 ? (totalIncome / total) * 100 : 0;
  const expensesPercent = total > 0 ? (totalExpenses / total) * 100 : 0;

  return (
    <div className='grid gap-3 grid-cols-1 md:grid-cols-3'>
      {/* Carte Revenus */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Revenus totaux</CardTitle>
          <IconTrendingUp className='size-4 text-green-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>{totalIncome.toFixed(2)} €</div>
          <p className='text-xs text-muted-foreground'>{incomePercent.toFixed(1)}% du total</p>
          <div className='mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
            <div className='h-full bg-green-600' style={{ width: `${incomePercent}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Carte Dépenses */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Dépenses totales</CardTitle>
          <IconTrendingDown className='size-4 text-red-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>{totalExpenses.toFixed(2)} €</div>
          <p className='text-xs text-muted-foreground'>{expensesPercent.toFixed(1)}% du total</p>
          <div className='mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
            <div className='h-full bg-red-600' style={{ width: `${expensesPercent}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Carte Solde */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Solde</CardTitle>
          <IconWallet className='size-4 text-primary' />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}
            {balance.toFixed(2)} €
          </div>
          <p className='text-xs text-muted-foreground'>{balance >= 0 ? 'Excédent' : 'Déficit'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
