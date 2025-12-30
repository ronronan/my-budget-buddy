import { IconCalculator, IconCash, IconDashboard, IconMoneybag, IconSettings, IconShoppingCart } from '@tabler/icons-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: IconDashboard,
    },
    {
      title: 'Budget Annuel',
      url: '/budget-annuel',
      icon: IconCalculator,
    },
    {
      title: 'Suivi Livret',
      url: '/suivi-livret',
      icon: IconCash,
    },
    {
      title: 'Suivi Dépense',
      url: '/suivi-depense',
      icon: IconShoppingCart,
    },
  ],
  navSecondary: [
    {
      title: 'Paramètres',
      url: '/settings',
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <Link to='/'>
                <IconMoneybag className='size-5!' />
                <span className='text-base font-semibold'>My Budget Buddy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
