import {
  IconBuildingStore,
  IconBus,
  IconCar,
  IconCoffee,
  IconCreditCard,
  IconDeviceGamepad2,
  IconFirstAidKit,
  IconGasStation,
  IconGift,
  IconHome,
  IconMoneybag,
  IconPigMoney,
  IconPlane,
  IconReceipt,
  IconShirt,
  IconShoppingCart,
  IconWallet,
  IconCoin,
  IconChartPie,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const BUDGET_ICONS = [
  { name: 'IconShoppingCart', icon: IconShoppingCart },
  { name: 'IconCar', icon: IconCar },
  { name: 'IconHome', icon: IconHome },
  { name: 'IconDeviceGamepad2', icon: IconDeviceGamepad2 },
  { name: 'IconFirstAidKit', icon: IconFirstAidKit },
  { name: 'IconMoneybag', icon: IconMoneybag },
  { name: 'IconCreditCard', icon: IconCreditCard },
  { name: 'IconWallet', icon: IconWallet },
  { name: 'IconPigMoney', icon: IconPigMoney },
  { name: 'IconReceipt', icon: IconReceipt },
  { name: 'IconGasStation', icon: IconGasStation },
  { name: 'IconBus', icon: IconBus },
  { name: 'IconCoffee', icon: IconCoffee },
  { name: 'IconShirt', icon: IconShirt },
  { name: 'IconBuildingStore', icon: IconBuildingStore },
  { name: 'IconPlane', icon: IconPlane },
  { name: 'IconGift', icon: IconGift },
  { name: 'IconCoin', icon: IconCoin },
  { name: 'IconChartPie', icon: IconChartPie },
  { name: 'IconTrendingUp', icon: IconTrendingUp },
];

interface IconPickerProps {
  value?: string | null;
  onChange: (icon: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const selectedIcon = BUDGET_ICONS.find((i) => i.name === value);
  const SelectedIconComponent = selectedIcon?.icon || IconShoppingCart;

  return (
    <div className='space-y-2.5'>
      {label && <Label className='text-sm font-medium'>{label}</Label>}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='outline' className='h-11 w-full justify-start gap-2.5'>
            <SelectedIconComponent className='size-5' />
            <span>{selectedIcon?.name.replace('Icon', '') || 'Sélectionner une icône'}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='bottom' className='h-[450px]'>
          <SheetHeader className='pb-4'>
            <SheetTitle>Choisir une icône</SheetTitle>
            <SheetDescription>Sélectionnez une icône pour votre catégorie</SheetDescription>
          </SheetHeader>
          <div className='mt-6 grid grid-cols-5 gap-3'>
            {BUDGET_ICONS.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type='button'
                className={cn(
                  'flex size-20 items-center justify-center rounded-lg border-2 transition-all hover:bg-accent hover:scale-105',
                  value === name ? 'border-primary bg-accent ring-2 ring-primary ring-offset-2' : 'border-transparent',
                )}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                aria-label={name}
              >
                <Icon className='size-9' />
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
