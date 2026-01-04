import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, showPageNumbers = true }: PaginationProps) {
  // Si une seule page, ne rien afficher
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Générer les numéros de pages à afficher avec stratégie d'ellipses
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      // Si 5 pages ou moins, afficher toutes les pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];

    // Toujours afficher la première page
    pages.push(1);

    if (currentPage <= 3) {
      // Début : [1] [2] [3] [...] [last]
      pages.push(2, 3, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Fin : [1] [...] [last-2] [last-1] [last]
      pages.push('ellipsis', totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Milieu : [1] [...] [current-1] [current] [current+1] [...] [last]
      pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className='flex flex-col items-center gap-2 sm:flex-row sm:justify-between'>
      {/* Boutons de navigation */}
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label='Page précédente'
          className='size-9 p-0'
        >
          <IconChevronLeft className='size-4' />
        </Button>

        {/* Numéros de pages (masqués sur mobile si showPageNumbers=false) */}
        {showPageNumbers && (
          <div className='hidden items-center gap-1 md:flex'>
            {pageNumbers.map((page, index) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className='px-2 text-sm text-muted-foreground'>
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={cn('size-9 p-0', currentPage === page && 'pointer-events-none')}
                >
                  {page}
                </Button>
              ),
            )}
          </div>
        )}

        <Button
          variant='outline'
          size='sm'
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label='Page suivante'
          className='size-9 p-0'
        >
          <IconChevronRight className='size-4' />
        </Button>
      </div>

      {/* Info textuelle */}
      <span className='text-sm text-muted-foreground' aria-live='polite'>
        Page {currentPage} sur {totalPages}
      </span>
    </div>
  );
}
