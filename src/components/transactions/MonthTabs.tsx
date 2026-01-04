import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MONTH_NAMES } from '@/types/budget.types';

interface MonthTabsProps {
  selectedMonth: number; // 1-12
  selectedYear: number;
  onMonthChange: (month: number) => void;
}

export function MonthTabs({ selectedMonth, onMonthChange }: MonthTabsProps) {
  // Générer les labels courts des mois (3 premières lettres)
  const monthShortNames = MONTH_NAMES.map((name) => name.slice(0, 3));

  // Mois actuel pour highlight si année courante
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12

  return (
    <Tabs value={String(selectedMonth)} onValueChange={(value) => onMonthChange(parseInt(value))} className='w-full'>
      <TabsList className='h-auto w-full overflow-x-auto scroll-smooth snap-x snap-mandatory md:overflow-visible'>
        {monthShortNames.map((monthLabel, index) => {
          const month = index + 1; // 1-12
          const isCurrentMonth = month === currentMonth;

          return (
            <TabsTrigger
              key={month}
              value={String(month)}
              className='min-w-[60px] snap-center text-xs md:min-w-0 md:flex-1 md:text-sm'
              aria-label={MONTH_NAMES[index]}
            >
              <span className={isCurrentMonth ? 'font-bold' : ''}>{monthLabel}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
