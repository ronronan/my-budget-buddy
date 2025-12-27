import {
  IconBuildingStore,
  IconBus,
  IconCar,
  IconChartPie,
  IconCoffee,
  IconCoin,
  IconCreditCard,
  IconDeviceGamepad2,
  IconDotsVertical,
  IconFirstAidKit,
  IconGasStation,
  IconGift,
  IconGripVertical,
  IconHome,
  IconMoneybag,
  IconPigMoney,
  IconPlane,
  IconReceipt,
  IconShirt,
  IconShoppingCart,
  IconTrendingUp,
  IconWallet,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type Category, type CategoryWithSubcategories } from '@/types/budget.types';

// Map des icônes
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  IconShoppingCart,
  IconCar,
  IconHome,
  IconDeviceGamepad2,
  IconFirstAidKit,
  IconMoneybag,
  IconCreditCard,
  IconWallet,
  IconPigMoney,
  IconReceipt,
  IconGasStation,
  IconBus,
  IconCoffee,
  IconShirt,
  IconBuildingStore,
  IconPlane,
  IconGift,
  IconCoin,
  IconChartPie,
  IconTrendingUp,
};

interface CategoryItemProps {
  category: CategoryWithSubcategories | Category;
  isSubcategory?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory?: (parentCategory: Category) => void;
  isDragging?: boolean;
}

export function CategoryItem({ category, isSubcategory = false, onEdit, onDelete, onAddSubcategory, isDragging = false }: CategoryItemProps) {
  const IconComponent = category.icon ? ICON_MAP[category.icon] || IconShoppingCart : IconShoppingCart;
  const hasSubcategories = 'subcategories' in category && category.subcategories.length > 0;

  const handleDelete = () => {
    const confirmMessage = hasSubcategories
      ? `Supprimer "${category.name}" et ses ${category.subcategories.length} sous-catégorie(s) ?`
      : `Supprimer "${category.name}" ?`;

    if (window.confirm(confirmMessage)) {
      onDelete(category.id);
    }
  };

  return (
    <div className={cn('space-y-2', isDragging && 'opacity-50')}>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent',
          isSubcategory && 'ml-8 border-l-4',
        )}
        style={{ borderLeftColor: isSubcategory ? category.color : undefined }}
      >
        {/* Drag handle */}
        <button type='button' className='cursor-grab touch-none text-muted-foreground hover:text-foreground' aria-label='Déplacer'>
          <IconGripVertical className='size-5' />
        </button>

        {/* Icône */}
        <div className='flex size-10 shrink-0 items-center justify-center rounded-md' style={{ backgroundColor: category.color + '20' }}>
          <IconComponent className='size-6' style={{ color: category.color }} />
        </div>

        {/* Nom */}
        <div className='flex-1 min-w-0'>
          <p className='font-medium truncate'>{category.name}</p>
          {hasSubcategories && <p className='text-xs text-muted-foreground'>{category.subcategories.length} sous-catégorie(s)</p>}
        </div>

        {/* Budget badge */}
        {category.budget && (
          <Badge variant='secondary'>
            {category.budget.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </Badge>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='size-8'>
              <IconDotsVertical className='size-4' />
              <span className='sr-only'>Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(category)}>Modifier</DropdownMenuItem>
            {!isSubcategory && onAddSubcategory && (
              <>
                <DropdownMenuItem onClick={() => onAddSubcategory(category)}>Ajouter une sous-catégorie</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleDelete} className='text-destructive focus:text-destructive'>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sous-catégories */}
      {hasSubcategories && (
        <div className='space-y-2'>
          {category.subcategories.map((sub) => (
            <CategoryItem key={sub.id} category={sub} isSubcategory onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
