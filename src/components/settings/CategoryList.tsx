import { DndContext, type DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { CategoryItem } from '@/components/settings/CategoryItem';
import { type Category, type CategoryWithSubcategories } from '@/types/budget.types';

interface CategoryListProps {
  categories: CategoryWithSubcategories[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parentCategory: Category) => void;
  onReorder: (reorderedIds: string[]) => void;
}

interface SortableCategoryItemProps {
  category: CategoryWithSubcategories;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parentCategory: Category) => void;
}

function SortableCategoryItem({ category, onEdit, onDelete, onAddSubcategory }: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CategoryItem category={category} onEdit={onEdit} onDelete={onDelete} onAddSubcategory={onAddSubcategory} isDragging={isDragging} />
    </div>
  );
}

export function CategoryList({ categories, onEdit, onDelete, onAddSubcategory, onReorder }: CategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    const reorderedIds = reordered.map((cat) => cat.id);

    onReorder(reorderedIds);
  };

  if (categories.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
        <p className='text-sm text-muted-foreground'>Aucune catégorie pour le moment.</p>
        <p className='text-xs text-muted-foreground'>Cliquez sur "Nouvelle catégorie" pour commencer.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
        <div className='space-y-2'>
          {categories.map((category) => (
            <SortableCategoryItem key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} onAddSubcategory={onAddSubcategory} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
