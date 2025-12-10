import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.vite/main',
    target: 'node18',
    minify: false,
    emptyOutDir: true,
  }
});
