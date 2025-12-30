import { IconPlus, IconShoppingCart, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudget } from '@/hooks/useBudget';

export default function Page() {
  const { categories, loading } = useBudget();

  // Calculer les statistiques (pour l'instant des données fictives)
  const stats = {
    totalDepenses: 0,
    totalRevenus: 0,
    solde: 0,
  };

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-3 py-3 px-3 md:gap-4 md:py-4 md:px-4 lg:gap-6 lg:py-6 lg:px-6'>
            <div className='flex items-center justify-end'>
              <Button className='w-full sm:w-auto'>
                <IconPlus className='mr-2 size-4' />
                Nouvelle transaction
              </Button>
            </div>

            {/* Cartes de statistiques */}
            <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Dépenses totales</CardTitle>
                  <IconTrendingDown className='size-4 text-red-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalDepenses.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>Ce mois-ci</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Revenus totaux</CardTitle>
                  <IconTrendingUp className='size-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalRevenus.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>Ce mois-ci</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Solde</CardTitle>
                  <IconShoppingCart className='size-4 text-primary' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.solde.toFixed(2)} €</div>
                  <p className='text-xs text-muted-foreground'>Différence revenus/dépenses</p>
                </CardContent>
              </Card>
            </div>

            {/* Dépenses par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Dépenses par catégorie</CardTitle>
                <CardDescription>Répartition de vos dépenses ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className='space-y-2'>
                    <Skeleton className='h-12' />
                    <Skeleton className='h-12' />
                    <Skeleton className='h-12' />
                  </div>
                ) : categories.length === 0 ? (
                  <div className='text-center text-sm text-muted-foreground py-8'>
                    <p>Aucune catégorie configurée</p>
                    <p className='mt-2'>Créez vos catégories dans les paramètres</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {categories.map((category) => (
                      <div key={category.id} className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='size-4 rounded-full' style={{ backgroundColor: category.color }} />
                          <span className='font-medium'>{category.name}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-semibold'>0.00 €</div>
                          <div className='text-xs text-muted-foreground'>0%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dernières transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Dernières transactions</CardTitle>
                <CardDescription>Historique de vos dépenses et revenus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center text-sm text-muted-foreground py-8'>Aucune transaction enregistrée pour le moment</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
