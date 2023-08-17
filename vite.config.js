import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: '../dist'
  },
  plugins: [react()],
  root: 'client',
  server: {
    host: true,
    strictPort: true,
    port: 5173,
  }
});
