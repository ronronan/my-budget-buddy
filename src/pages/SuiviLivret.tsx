import { IconCash, IconPlus } from '@tabler/icons-react';

import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudget } from '@/hooks/useBudget';

export default function Page() {
  const { livrets, livretsLoading } = useBudget();

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
            <div className='flex items-center justify-end'>
              <Button>
                <IconPlus className='mr-2 size-4' />
                Ajouter une opération
              </Button>
            </div>

            {livretsLoading ? (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <Skeleton className='h-32' />
                <Skeleton className='h-32' />
                <Skeleton className='h-32' />
              </div>
            ) : livrets.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconCash className='mb-4 size-12 text-muted-foreground opacity-50' />
                  <h3 className='mb-2 text-lg font-semibold'>Aucun livret configuré</h3>
                  <p className='mb-4 text-center text-sm text-muted-foreground'>Commencez par créer vos livrets dans les paramètres</p>
                  <Button variant='outline'>Aller aux paramètres</Button>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {livrets.map((livret) => (
                  <Card key={livret.id}>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='flex size-10 items-center justify-center rounded-full bg-primary/10'>
                            <IconCash className='size-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-base'>{livret.name}</CardTitle>
                            <CardDescription>Livret d'épargne</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <div className='flex items-baseline justify-between'>
                          <span className='text-sm text-muted-foreground'>Solde actuel</span>
                          <span className='text-2xl font-bold'>{livret.soldeDepart.toFixed(2)} €</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>Solde initial</span>
                          <span>{livret.soldeDepart.toFixed(2)} €</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>Variation</span>
                          <span className='text-green-600'>+0.00 €</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {livrets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des opérations</CardTitle>
                  <CardDescription>Dernières transactions sur vos livrets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-center text-sm text-muted-foreground py-8'>Aucune opération enregistrée pour le moment</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
