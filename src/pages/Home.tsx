import { IconCash, IconChartBar, IconSettings, IconShoppingCart } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/hooks/useBudget';

export default function Page() {
  const { livrets, categories } = useBudget();

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
            {/* Cartes de résumé */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Livrets configurés</CardTitle>
                  <IconCash className='size-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{livrets.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    {livrets.length === 0
                      ? 'Aucun livret'
                      : `Épargne totale: ${livrets.reduce((acc, l) => acc + l.soldeDepart, 0).toFixed(2)} €`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Catégories</CardTitle>
                  <IconChartBar className='size-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{categories.length}</div>
                  <p className='text-xs text-muted-foreground'>{categories.length === 0 ? 'Aucune catégorie' : 'Catégories configurées'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
                  <IconShoppingCart className='size-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>0</div>
                  <p className='text-xs text-muted-foreground'>Ce mois-ci</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
              </CardHeader>
              <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <Link to='/suivi-livret'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconCash className='mr-2 size-4' />
                    Gérer mes livrets
                  </Button>
                </Link>
                <Link to='/suivi-depense'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconShoppingCart className='mr-2 size-4' />
                    Suivre mes dépenses
                  </Button>
                </Link>
                <Link to='/settings'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconSettings className='mr-2 size-4' />
                    Paramètres
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Message de bienvenue si aucune donnée */}
            {livrets.length === 0 && categories.length === 0 && (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <h3 className='mb-2 text-lg font-semibold'>Bienvenue sur My Budget Buddy !</h3>
                  <p className='mb-4 text-center text-sm text-muted-foreground'>
                    Commencez par configurer vos catégories et vos livrets dans les paramètres
                  </p>
                  <Link to='/settings'>
                    <Button>
                      <IconSettings className='mr-2 size-4' />
                      Aller aux paramètres
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
