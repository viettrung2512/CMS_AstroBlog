import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  vite: {
    server: {
      port: 5173,
      open: true,
      strictPort: true,
    },
  },
});
