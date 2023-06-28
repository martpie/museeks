import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const externals = ['fs', 'electron', 'globby', 'queue'];
const minify = process.env.NODE_ENV === 'production';

const commonNodeConfig = {
  minify,
  target: 'node18',
  sourcemap: true,
  emptyOutDir: true,
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: externals })],
    build: {
      ...commonNodeConfig,
      outDir: 'dist/main',

      lib: {
        entry: './src/main/entrypoint.ts',
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: externals })],
    build: {
      ...commonNodeConfig,
      outDir: 'dist/preload',
      lib: {
        entry: './src/preload/entrypoint.ts',
      },
    },
  },
  renderer: {
    plugins: [react()],
    appType: 'spa',
    build: {
      minify,
      sourcemap: true,
      emptyOutDir: true,
      outDir: 'dist/renderer',
    },
  },
});
