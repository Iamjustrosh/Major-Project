import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load .env from project root
  const env = loadEnv(mode, process.cwd(), '');

  return {
    resolve: {
      browserField: false,
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    define: {
      // Bake the key into the built main.js at compile time
      'process.env.VITE_JUDGE0_API': JSON.stringify(env.VITE_JUDGE0_API),
    },
  };
});