import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(() => ({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, '.'),
    },
  },
  server: {
    hmr: (globalThis as any).process?.env?.DISABLE_HMR !== 'true',
    watch: (globalThis as any).process?.env?.DISABLE_HMR === 'true' ? null : {},
  },
}));
