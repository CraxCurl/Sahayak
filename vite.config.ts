import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@ai': path.resolve(__dirname, './src/ai'),
      '@dom': path.resolve(__dirname, './src/dom'),
      '@extension': path.resolve(__dirname, './src/extension'),
      '@forms': path.resolve(__dirname, './src/forms'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },
});
