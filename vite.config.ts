import { rmSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import electronMain from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';
import react from '@vitejs/plugin-react';

rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });

// TODO: all the modules below should be removed, and their usage transferred to the main process
const externals = [
  'electron',
  'fs',
  'path',
  // @deprecated (still used by iconv-lite)
  // 'stream',
  // @deprecated (still used by linvodb)
  'events',
  // @deprecated (still used by level-up)
  'assert',
];
const otherExternals = [
  'graceful-fs',
  // 'iconv-lite'
];

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
        entry: 'src/main/main.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist/main',
          },
        },
      },
      {
        entry: 'src/preload/main.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist/preload',
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
