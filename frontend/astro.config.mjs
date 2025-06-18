import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind(),
  ],
  renderers: ['@astrojs/renderer-react'], 
  vite: {
    server: {
      port: 5173,
      open: true,
      strictPort: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
});