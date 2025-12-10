import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  build: {
    outDir: '.vite/renderer/main_window',
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html'
    }
  }
});