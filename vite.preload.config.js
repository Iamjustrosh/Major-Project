import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.vite/preload',
    target: 'node18',
    minify: false,
    emptyOutDir: true,
  }
});
