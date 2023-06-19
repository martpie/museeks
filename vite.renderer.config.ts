import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const EXTERNALS = [
  'fs', // used by electron
  'electron',
];

// TODO: find a way to tell vite/rollup to convert
// import from electron => require('electron');
export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: '.vite/',
    rollupOptions: {
      external: EXTERNALS,
    },
  },
  optimizeDeps: {
    exclude: ['electron', 'fs'],
  },
});
