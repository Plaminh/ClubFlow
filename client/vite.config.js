import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
