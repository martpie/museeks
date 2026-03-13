import { lingui } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import stylex from '@stylexjs/unplugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react /*, { reactCompilerPreset } */ from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

// Workaround for decorators: https://vite.dev/guide/migration#javascript-transforms-by-oxc
// Blocked by https://github.com/oxc-project/oxc/issues/9170
function decoratorPreset(options: Record<string, unknown>) {
  return {
    preset: () => ({
      plugins: [['@babel/plugin-proposal-decorators', options]],
    }),
    rolldown: {
      // Only run this transform if the file contains a decorator.
      filter: {
        code: '@',
      },
    },
  };
}

export const VITE_PLUGINS: PluginOption[] = [
  stylex.vite({
    useCSSLayers: true,
    propertyValidationMode: 'throw',
  }),
  react(),
  lingui(),
  tanstackRouter({
    target: 'react',
    generatedRouteTree: './src/generated/route-tree.ts',
  }),
  svgr(),
  babel({
    presets: [
      // reactCompilerPreset(),
      decoratorPreset({ version: '2023-11' }),
    ],
    plugins: ['@lingui/babel-plugin-lingui-macro'],
  }),
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: VITE_PLUGINS,

  build: {
    target: ['edge115', 'chrome115', 'safari13'],
    cssMinify: 'lightningcss',
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(
        browserslist(['edge >=115', 'chrome >=115', 'safari >=13']),
      ),
    },
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
