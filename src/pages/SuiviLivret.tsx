import { IconCash, IconCopy, IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { LivretTresorerieChart } from '@/components/livret/LivretTresorerieChart';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudget } from '@/hooks/useBudget';
import { MONTH_NAMES, type MonthlySoldes, createEmptyMonthlySoldes, getSoldesForYear, updateSoldesForYear } from '@/types/budget.types';

export default function SuiviLivret() {
  const { livrets, livretsLoading, updateLivret } = useBudget();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [editingSoldes, setEditingSoldes] = useState<Record<string, MonthlySoldes>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Générer une liste d'années (année courante - 2 à année courante + 5)
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

  // Mettre à jour un solde mensuel
  const updateMonthlySolde = (livretId: string, month: number, value: string) => {
    // Gérer la valeur vide ou invalide
    const numValue = value === '' ? 0 : parseFloat(value);
    const finalValue = isNaN(numValue) ? 0 : Math.round(numValue * 100) / 100; // Limiter à 2 décimales

    setEditingSoldes((prev) => ({
      ...prev,
      [livretId]: {
        ...(prev[livretId] || createEmptyMonthlySoldes()),
        [month]: finalValue,
      },
    }));
    setHasChanges(true);
  };

  // Remplir automatiquement tous les mois à 0 avec la valeur d'un mois de référence
  const fillFromReferenceMonth = (livretId: string, referenceMonth: number) => {
    const currentSoldes = editingSoldes[livretId] || createEmptyMonthlySoldes();
    const referenceValue = currentSoldes[referenceMonth] || 0;

    if (referenceValue === 0) {
      toast.error('Le mois de référence doit avoir une valeur non nulle');
      return;
    }

    const updatedSoldes = { ...currentSoldes };
    let filledCount = 0;

    // Remplir tous les mois à 0 avec la valeur de référence
    for (let month = 1; month <= 12; month++) {
      if (updatedSoldes[month] === 0) {
        updatedSoldes[month] = referenceValue;
        filledCount++;
      }
    }

    if (filledCount === 0) {
      toast.info('Tous les mois ont déjà une valeur');
      return;
    }

    setEditingSoldes((prev) => ({
      ...prev,
      [livretId]: updatedSoldes,
    }));
    setHasChanges(true);
    toast.success(`${filledCount} mois remplis avec ${referenceValue.toFixed(2)} €`);
  };

  // Sauvegarder tous les changements
  const saveAllChanges = async () => {
    try {
      const updates = Object.entries(editingSoldes).map(([livretId, monthlySoldes]) => {
        const livret = livrets.find((l) => l.id === livretId);
        if (!livret) return Promise.resolve();

        // Mettre à jour yearlySoldes avec les soldes de l'année sélectionnée
        const yearlySoldes = updateSoldesForYear(livret, selectedYear, monthlySoldes);
        return updateLivret(livretId, { yearlySoldes });
      });

      await Promise.all(updates);
      toast.success('Soldes mis à jour avec succès');
      setHasChanges(false);
      setEditingSoldes({});
    } catch (error) {
      console.error('Error saving soldes:', error);
      toast.error('Erreur lors de la sauvegarde des soldes');
    }
  };

  if (livretsLoading) {
    return (
      <>
        <SiteHeader />
        <div className='flex flex-1 items-center justify-center'>
          <p className='text-muted-foreground'>Chargement...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-3 py-3 px-3 md:gap-4 md:py-4 md:px-4 lg:gap-6 lg:py-6 lg:px-6'>
            {/* En-tête */}
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>Suivi des Livrets</h1>
                  <p className='text-sm text-muted-foreground'>
                    Enregistrez vos soldes mensuels et visualisez l'évolution de votre trésorerie
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => {
                      setSelectedYear(parseInt(value));
                      setEditingSoldes({}); // Réinitialiser les soldes en édition
                      setHasChanges(false);
                    }}
                  >
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasChanges && (
                    <Button onClick={saveAllChanges} size='sm'>
                      <IconDeviceFloppy className='mr-2 size-4' />
                      Sauvegarder
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {livrets.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconCash className='mb-4 size-12 text-muted-foreground opacity-50' />
                  <h3 className='mb-2 text-lg font-semibold'>Aucun livret configuré</h3>
                  <p className='mb-4 text-center text-sm text-muted-foreground'>Commencez par créer vos livrets dans les paramètres</p>
                  <Button variant='outline'>Aller aux paramètres</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Graphique de trésorerie */}
                <LivretTresorerieChart livrets={livrets} selectedYear={selectedYear} />

                {/* Grille de saisie des soldes */}
                <div className='space-y-3'>
                  <h2 className='text-lg font-semibold'>Soldes mensuels par livret</h2>
                  {livrets.map((livret) => {
                    const currentSoldes = editingSoldes[livret.id] || getSoldesForYear(livret, selectedYear);

                    return (
                      <Card key={livret.id}>
                        <CardHeader className='pb-3'>
                          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='flex size-10 items-center justify-center rounded-full bg-primary/10'>
                                <IconCash className='size-5 text-primary' />
                              </div>
                              <div>
                                <CardTitle className='text-base'>{livret.name}</CardTitle>
                                <p className='text-xs text-muted-foreground'>Solde de départ : {livret.soldeDepart.toFixed(2)} €</p>
                              </div>
                            </div>
                            <Select onValueChange={(value) => fillFromReferenceMonth(livret.id, parseInt(value))}>
                              <SelectTrigger className='h-8 w-auto gap-1 text-xs'>
                                <IconCopy className='size-3.5' />
                                <span className='hidden sm:inline'>Remplir depuis</span>
                              </SelectTrigger>
                              <SelectContent>
                                {MONTH_NAMES.map((monthName, index) => (
                                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {monthName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
                            {MONTH_NAMES.map((monthName, index) => {
                              const monthNumber = index + 1;
                              return (
                                <div key={monthNumber} className='space-y-1'>
                                  <Label htmlFor={`${livret.id}-${monthNumber}`} className='text-xs'>
                                    {monthName}
                                  </Label>
                                  <Input
                                    id={`${livret.id}-${monthNumber}`}
                                    type='number'
                                    inputMode='decimal'
                                    step='0.01'
                                    value={currentSoldes[monthNumber] || 0}
                                    onChange={(e) => updateMonthlySolde(livret.id, monthNumber, e.target.value)}
                                    className='h-9'
                                    placeholder='0.00'
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
