import { rmSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import react from '@vitejs/plugin-react';

rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });

// TODO: all the modules below should be removed, and their usage transferred to the main process
const externals = [
  'electron',
  'fs',
  'path',
  // @deprecated (still used by iconv-lite)
  'stream',
  // @deprecated (still used by linvodb)
  'events',
  // @deprecated (still used by level-up)
  'assert',
];
const otherExternals = ['graceful-fs'];

export default defineConfig({
  appType: 'spa',
  plugins: [
    react(),
    electron({
      renderer: {
        resolve: () => [...externals, ...otherExternals],
      },
      main: {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist/main',
          },
        },
      },
      preload: {
        input: './src/preload/main.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist/preload',
          },
        },
      },
    }),
  ],
  build: {
    outDir: 'dist/renderer',
  },
});
