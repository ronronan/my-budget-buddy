import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { BudgetProvider } from '@/contexts/BudgetContext';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BudgetProvider>
          <App />
          <Toaster position='top-right' />
        </BudgetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
