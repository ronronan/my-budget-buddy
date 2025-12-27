import { CategoryManager } from '@/components/settings/CategoryManager';
import { SiteHeader } from '@/components/site-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
            <h1 className='text-2xl font-bold'>Paramètres</h1>

            <Tabs defaultValue='categories' className='w-full'>
              <TabsList>
                <TabsTrigger value='categories'>Catégories</TabsTrigger>
                <TabsTrigger value='profile'>Profil</TabsTrigger>
              </TabsList>

              <TabsContent value='categories' className='space-y-4'>
                <CategoryManager />
              </TabsContent>

              <TabsContent value='profile' className='space-y-4'>
                <p className='text-sm text-muted-foreground'>Section Profil à implémenter</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
