import { lingui } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import stylex from '@stylexjs/unplugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

export const VITE_PLUGINS: PluginOption[] = [
  stylex.vite({
    useCSSLayers: true,
    propertyValidationMode: 'throw',
  }),
  react(),
  babel({
    presets: [reactCompilerPreset],
    plugins: [],
    // plugins: ['@lingui/babel-plugin-lingui-macro'],
    parserOpts: {
      plugins: ['decorators'],
    },
    // wat
    assumptions: undefined,
    auxiliaryCommentAfter: undefined,
    auxiliaryCommentBefore: undefined,
    comments: undefined,
    compact: undefined,
    cwd: undefined,
    generatorOpts: undefined,
    retainLines: undefined,
    shouldPrintComment: undefined,
    targets: undefined,
    wrapPluginVisitorMethod: undefined,
  }),
  // lingui(),
  tanstackRouter({
    target: 'react',
    generatedRouteTree: './src/generated/route-tree.ts',
  }),
  svgr(),
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
      // targets: browserslistToTargets(
      //   browserslist(['edge >=115', 'chrome >=115', 'safari >=13']),
      // ),
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
