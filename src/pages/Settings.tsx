import { CategoryManager } from '@/components/settings/CategoryManager';
import { LivretManager } from '@/components/settings/LivretManager';
import { SiteHeader } from '@/components/site-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  return (
    <>
      <SiteHeader />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
            <Tabs defaultValue='categories' className='w-full'>
              <TabsList>
                <TabsTrigger value='categories'>Catégories</TabsTrigger>
                <TabsTrigger value='livret'>Livret</TabsTrigger>
              </TabsList>

              <TabsContent value='categories' className='space-y-4'>
                <CategoryManager />
              </TabsContent>

              <TabsContent value='livret' className='space-y-4'>
                <LivretManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
