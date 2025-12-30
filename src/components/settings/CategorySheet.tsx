import { useEffect, useState } from 'react';

import { ColorPicker } from '@/components/settings/ColorPicker';
import { IconPicker } from '@/components/settings/IconPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { type CategoryFormData, categorySchema } from '@/lib/validation/category.schema';
import { type Category, type CategoryInput } from '@/types/budget.types';

interface CategorySheetProps {
  open: boolean;
  category?: Category | null;
  parentCategory?: Category;
  categories?: Category[];
  onClose: () => void;
  onSubmit: (data: CategoryInput) => Promise<void>;
}

export function CategorySheet({ open, category, parentCategory, categories = [], onClose, onSubmit }: CategorySheetProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: '#3b82f6',
    icon: 'IconShoppingCart',
    parentId: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!category;
  const isSubcategory = !!parentCategory;

  // Réinitialiser le formulaire quand le sheet s'ouvre/ferme ou que la catégorie change
  useEffect(() => {
    if (open) {
      if (category) {
        // Mode édition
        setFormData({
          name: category.name,
          color: category.color,
          icon: category.icon || 'IconShoppingCart',
          parentId: category.parentId || undefined,
        });
      } else {
        // Mode création
        // Si c'est une sous-catégorie, pré-sélectionner l'icône et la couleur du parent
        setFormData({
          name: '',
          color: parentCategory?.color || '#3b82f6',
          icon: parentCategory?.icon || 'IconShoppingCart',
          parentId: parentCategory?.id || undefined,
        });
      }
      setErrors({});
    }
  }, [open, category, parentCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation avec Zod
    const result = categorySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CategoryFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof CategoryFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      // Convertir null en undefined pour CategoryInput
      const submitData: CategoryInput = {
        ...result.data,
        icon: result.data.icon || undefined,
        parentId: result.data.parentId || undefined,
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrer les catégories parentes (pas de sous-catégories)
  const parentCategories = categories.filter((cat) => cat.parentId === null);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
        <SheetHeader className='pb-4'>
          <SheetTitle>{isEditing ? 'Modifier la catégorie' : isSubcategory ? 'Nouvelle sous-catégorie' : 'Nouvelle catégorie'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifiez les informations de la catégorie.'
              : isSubcategory
                ? `Créer une sous-catégorie de "${parentCategory?.name}".`
                : 'Créez une nouvelle catégorie pour organiser votre budget.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='space-y-6 py-6'>
          {/* Nom */}
          <div className='space-y-2.5'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Nom <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='Ex: Alimentation'
              disabled={isSubmitting}
              className='h-11'
            />
            {errors.name && <p className='text-sm text-destructive'>{errors.name}</p>}
          </div>

          {/* Icône */}
          <IconPicker label='Icône' value={formData.icon} onChange={(icon) => setFormData({ ...formData, icon })} />

          {/* Couleur */}
          <ColorPicker
            label={
              <>
                Couleur <span className='text-destructive'>*</span>
              </>
            }
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
          />
          {errors.color && <p className='text-sm text-destructive'>{errors.color}</p>}

          {/* Catégorie parente (seulement en création et si pas déjà une sous-catégorie) */}
          {!isEditing && !isSubcategory && parentCategories.length > 0 && (
            <div className='space-y-2.5'>
              <Label htmlFor='parentId' className='text-sm font-medium'>
                Catégorie parente (optionnel)
              </Label>
              <Select
                value={formData.parentId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? undefined : value })}
              >
                <SelectTrigger id='parentId' disabled={isSubmitting} className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Aucune (catégorie principale)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <SheetFooter className='gap-3 pt-6 sm:gap-2'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting} className='h-11'>
              Annuler
            </Button>
            <Button type='submit' disabled={isSubmitting} className='h-11'>
              {isSubmitting ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
