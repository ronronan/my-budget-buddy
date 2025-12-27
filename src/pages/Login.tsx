import { IconMoneybag } from '@tabler/icons-react';

import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='flex w-full max-w-md flex-col items-center gap-6'>
        <div className='flex items-center gap-2'>
          <IconMoneybag className='size-8' />
          <h1 className='text-2xl font-bold'>My Budget Buddy</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
