import { Route, Routes } from 'react-router-dom';

import { AppSidebar } from './components/app-sidebar';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import Home from './pages/Home';
import PageTwo from './pages/PageTwo';
import Settings from './pages/Settings';

function App() {
  return (
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
  );
}

export default App;
