import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

import { CategoryList } from '@/components/settings/CategoryList';
import { CategorySheet } from '@/components/settings/CategorySheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBudget } from '@/hooks/useBudget';
import { type Category, type CategoryInput } from '@/types/budget.types';

export function CategoryManager() {
  const { categories, loading, createCategory, updateCategory, deleteCategory, reorderCategories } = useBudget();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | undefined>(undefined);

  const handleNew = () => {
    setSelectedCategory(null);
    setParentCategory(undefined);
    setIsSheetOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setParentCategory(undefined);
    setIsSheetOpen(true);
  };

  const handleAddSubcategory = (parent: Category) => {
    setSelectedCategory(null);
    setParentCategory(parent);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const handleSubmit = async (data: CategoryInput) => {
    if (selectedCategory) {
      // Mode édition
      await updateCategory(selectedCategory.id, data);
    } else {
      // Mode création
      await createCategory(data);
    }
  };

  const handleReorder = async (reorderedIds: string[]) => {
    await reorderCategories(reorderedIds);
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setSelectedCategory(null);
    setParentCategory(undefined);
  };

  // Flatten des catégories pour le select parent
  const allCategories: Category[] = categories.flatMap((cat) => [cat, ...cat.subcategories]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>Gérez vos catégories de budget et organisez vos dépenses</p>
        <Button onClick={handleNew} size='sm'>
          <IconPlus className='mr-2 size-4' />
          Nouvelle catégorie
        </Button>
      </div>

      {loading ? (
        <div className='space-y-2'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-16 w-full' />
        </div>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSubcategory={handleAddSubcategory}
          onReorder={handleReorder}
        />
      )}

      <CategorySheet
        open={isSheetOpen}
        category={selectedCategory}
        parentCategory={parentCategory}
        categories={allCategories}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
