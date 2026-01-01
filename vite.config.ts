import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 9999,
    host: false,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          react: ['react', 'react-dom', 'react/jsx-runtime'],
          // React Router
          'react-router': ['react-router-dom'],
          // Firebase
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Radix UI components
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // Data visualization
          recharts: ['recharts'],
          // Icons
          icons: ['@tabler/icons-react', 'lucide-react'],
          // Table library
          tanstack: ['@tanstack/react-table'],
        },
      },
    },
    // Augmenter la limite de taille des chunks
    chunkSizeWarningLimit: 1000,
  },
});
