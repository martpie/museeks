import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import preact from '@preact/preset-vite';

const externals = ['fs', 'electron', 'globby', 'queue', 'music-metadata'];
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
    plugins: [preact()],
    appType: 'spa',
    build: {
      minify,
      sourcemap: true,
      emptyOutDir: true,
      outDir: 'dist/renderer',
    },
  },
});
