import { IconCash, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudget } from '@/hooks/useBudget';
import { type Livret, type LivretInput } from '@/types/budget.types';

export function LivretManager() {
  const { livrets, livretsLoading: loading, createLivret, updateLivret, deleteLivret } = useBudget();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [livretToDelete, setLivretToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<LivretInput>({
    name: '',
    soldeDepart: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && editingId) {
        // Mode édition
        await updateLivret(editingId, formData);
        setIsEditing(false);
        setEditingId(null);
      } else {
        // Mode création
        await createLivret(formData);
      }

      // Reset form
      setFormData({ name: '', soldeDepart: 0 });
    } catch (err) {
      // L'erreur est déjà gérée dans le context avec toast
      console.error('Error submitting livret:', err);
    }
  };

  const handleEdit = (livret: Livret) => {
    setIsEditing(true);
    setEditingId(livret.id);
    setFormData({
      name: livret.name,
      soldeDepart: livret.soldeDepart,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', soldeDepart: 0 });
  };

  const handleDeleteClick = (id: string) => {
    setLivretToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (livretToDelete) {
      try {
        await deleteLivret(livretToDelete);
        setLivretToDelete(null);
        setDeleteDialogOpen(false);
      } catch (err) {
        // L'erreur est déjà gérée dans le context avec toast
        console.error('Error deleting livret:', err);
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Modifier le livret' : 'Nouveau livret'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Modifiez les informations de votre livret'
              : 'Ajoutez un nouveau livret à votre budget'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Nom du livret</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='Ex: Livret A, PEL, etc.'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='soldeDepart'>Solde de départ (€)</Label>
              <Input
                id='soldeDepart'
                type='number'
                step='0.01'
                value={formData.soldeDepart}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, soldeDepart: parseFloat(e.target.value) || 0 }))
                }
                placeholder='0.00'
                required
              />
            </div>

            <div className='flex gap-2'>
              <Button type='submit'>
                <IconPlus className='mr-2 size-4' />
                {isEditing ? 'Enregistrer' : 'Ajouter'}
              </Button>
              {isEditing && (
                <Button type='button' variant='outline' onClick={handleCancelEdit}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste des livrets */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Mes livrets</h3>

        {loading ? (
          <div className='space-y-2'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-20 w-full' />
          </div>
        ) : livrets.length === 0 ? (
          <Card>
            <CardContent className='py-8 text-center text-muted-foreground'>
              <IconCash className='mx-auto mb-2 size-12 opacity-50' />
              <p>Aucun livret configuré</p>
              <p className='text-sm'>Ajoutez votre premier livret ci-dessus</p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-2'>
            {livrets.map((livret) => (
              <Card key={livret.id}>
                <CardContent className='flex items-center justify-between py-4'>
                  <div className='flex items-center gap-4'>
                    <div className='flex size-10 items-center justify-center rounded-full bg-primary/10'>
                      <IconCash className='size-5 text-primary' />
                    </div>
                    <div>
                      <h4 className='font-medium'>{livret.name}</h4>
                      <p className='text-sm text-muted-foreground'>
                        Solde initial : {livret.soldeDepart.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleEdit(livret)}
                      disabled={isEditing && editingId !== livret.id}
                    >
                      <IconEdit className='size-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDeleteClick(livret.id)}
                      disabled={isEditing}
                    >
                      <IconTrash className='size-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le livret</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce livret ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
