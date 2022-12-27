import { rmSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import electronMain from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';
import react from '@vitejs/plugin-react';

rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });

const minify = process.env.NODE_ENV === 'production';

// TODO: all the modules below should be removed, and their usage transferred to the main process
const externals = ['electron'];
const otherExternals = [];

export default defineConfig({
  appType: 'spa',
  build: {
    sourcemap: true,
    outDir: 'dist/renderer',
  },
  plugins: [
    react(),
    electronMain([
      {
        entry: 'src/main/entrypoint.ts',
        vite: {
          build: {
            minify,
            target: 'es2022',
            sourcemap: true,
            outDir: 'dist/main',
            emptyOutDir: true,
          },
        },
      },
      {
        entry: 'src/preload/entrypoint.ts',
        vite: {
          build: {
            minify,
            target: 'es2022',
            sourcemap: true,
            outDir: 'dist/preload',
            emptyOutDir: true,
          },
        },
      },
    ]),
    electronRenderer({
      nodeIntegration: true,
      optimizeDeps: {
        include: [...externals, ...otherExternals],
      },
    }),
  ],
});
