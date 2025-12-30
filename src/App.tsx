import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import { AppSidebar } from './components/app-sidebar';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import SuiviDepense from './pages/SuiviDepense';
import SuiviLivret from './pages/SuiviLivret';

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* Routes protégées */}
      <Route
        path='/*'
        element={
          <ProtectedRoute>
            <SidebarProvider
              style={
                {
                  '--sidebar-width': 'calc(var(--spacing) * 72)',
                  '--header-height': 'calc(var(--spacing) * 12)',
                } as React.CSSProperties
              }
            >
              <AppSidebar variant='inset' />
              <SidebarInset>
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/suivi-livret' element={<SuiviLivret />} />
                  <Route path='/suivi-depense' element={<SuiviDepense />} />
                  <Route path='/settings' element={<Settings />} />
                </Routes>
              </SidebarInset>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
