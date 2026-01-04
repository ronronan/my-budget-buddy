import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

interface YearNavigatorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  minYear: number;
  maxYear: number;
}

export function YearNavigator({ selectedYear, onYearChange, minYear, maxYear }: YearNavigatorProps) {
  const handlePrevious = () => {
    if (selectedYear > minYear) {
      onYearChange(selectedYear - 1);
    }
  };

  const handleNext = () => {
    if (selectedYear < maxYear) {
      onYearChange(selectedYear + 1);
    }
  };

  return (
    <div className='flex items-center justify-center gap-4'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handlePrevious}
        disabled={selectedYear <= minYear}
        aria-label='Année précédente'
        className='size-8'
      >
        <IconChevronLeft className='size-5' />
      </Button>

      <span className='text-lg font-bold tabular-nums' aria-live='polite'>
        {selectedYear}
      </span>

      <Button
        variant='ghost'
        size='icon'
        onClick={handleNext}
        disabled={selectedYear >= maxYear}
        aria-label='Année suivante'
        className='size-8'
      >
        <IconChevronRight className='size-5' />
      </Button>
    </div>
  );
}
