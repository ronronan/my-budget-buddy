import { useState } from 'react';

import { Minus, Plus, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Wallet className='size-6 text-primary' />
            <CardTitle className='text-2xl'>My Budget Buddy</CardTitle>
          </div>
          <CardDescription>Votre assistant de gestion de budget personnel</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-col items-center gap-4'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>Compteur de démonstration</p>
              <p className='text-5xl font-bold tabular-nums'>{count}</p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='icon' onClick={() => setCount((c) => Math.max(0, c - 1))}>
                <Minus />
              </Button>
              <Button variant='default' onClick={() => setCount((c) => c + 1)}>
                <Plus />
                Incrémenter
              </Button>
            </div>
          </div>
          <div className='rounded-lg border bg-muted/50 p-4'>
            <p className='text-center text-sm text-muted-foreground'>
              Modifiez <code className='rounded bg-background px-1.5 py-0.5'>src/App.tsx</code> pour commencer à
              développer
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
