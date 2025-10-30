import { lingui } from '@lingui/vite-plugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

export const VITE_PLUGINS: PluginOption[] = [
  react({
    babel: {
      plugins: [
        '@lingui/babel-plugin-lingui-macro',
        'babel-plugin-react-compiler',
      ],
      parserOpts: {
        plugins: ['decorators'],
      },
    },
  }),
  lingui(),
  tanstackRouter({
    target: 'react',
    generatedRouteTree: './src/generated/route-tree.ts',
  }),
  svgr(),
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: VITE_PLUGINS,

  // LightningCSS
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      cssModules: true,
      targets: browserslistToTargets(
        browserslist(['last 3 Chrome versions', 'safari >= 13']),
      ),
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: [
        '**/src-tauri/**',
        '**/release/**',
        '**/.flatpak-builder/**',
        '**/.tanstack/**',
      ],
    },
  },
});
