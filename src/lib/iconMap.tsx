import {
  IconBuildingStore,
  IconBus,
  IconCar,
  IconChartPie,
  IconCoffee,
  IconCoin,
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
  IconTrendingUp,
  IconWallet,
} from '@tabler/icons-react';

/**
 * Map des icônes disponibles pour les catégories
 */
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
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

/**
 * Récupère le composant d'icône correspondant au nom
 * Retourne IconShoppingCart par défaut si l'icône n'existe pas
 */
export function getIconComponent(iconName?: string | null): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  if (!iconName) return IconShoppingCart;
  return ICON_MAP[iconName] || IconShoppingCart;
}
