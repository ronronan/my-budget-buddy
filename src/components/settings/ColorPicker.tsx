import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const BUDGET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: React.ReactNode;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className='space-y-2.5'>
      {label && <Label className='text-sm font-medium'>{label}</Label>}
      <div className='grid grid-cols-9 gap-3'>
        {BUDGET_COLORS.map((color) => (
          <button
            key={color}
            type='button'
            className={cn(
              'size-10 rounded-lg border-2 transition-all hover:scale-110',
              value === color ? 'border-foreground ring-2 ring-foreground ring-offset-2' : 'border-transparent',
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Couleur ${color}`}
          />
        ))}
      </div>
      <div className='flex items-center gap-2.5 rounded-md border bg-muted/50 px-3 py-2 text-sm'>
        <div className='size-5 rounded-md border-2 border-background shadow-sm' style={{ backgroundColor: value }} />
        <span className='font-medium'>{value}</span>
      </div>
    </div>
  );
}
