import { useLocation } from 'react-router-dom';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

const PAGE_TITLES: Record<string, { title: string; description?: string }> = {
  '/': { title: 'Dashboard', description: 'Vue d\'ensemble de votre budget' },
  '/suivi-livret': { title: 'Suivi des livrets', description: 'Gérez vos livrets d\'épargne' },
  '/suivi-depense': { title: 'Suivi des dépenses', description: 'Analysez vos dépenses' },
  '/settings': { title: 'Paramètres', description: 'Configurez votre application' },
};

export function SiteHeader() {
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'My Budget Buddy' };

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-3 md:px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mx-1 md:mx-2 data-[orientation=vertical]:h-4' />
        <div className='min-w-0 flex-1'>
          <h1 className='text-sm font-medium md:text-base truncate'>{pageInfo.title}</h1>
          {pageInfo.description && (
            <p className='text-xs text-muted-foreground hidden sm:block truncate'>{pageInfo.description}</p>
          )}
        </div>
      </div>
    </header>
  );
}
