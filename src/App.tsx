import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import { AppSidebar } from './components/app-sidebar';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import PageTwo from './pages/PageTwo';
import Register from './pages/Register';
import Settings from './pages/Settings';

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
                  <Route path='/two' element={<PageTwo />} />
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
