import { lingui } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import stylex from '@stylexjs/unplugin';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react /*, { reactCompilerPreset } */ from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import svgr from 'vite-plugin-svgr';
import { defineConfig, type PluginOption } from 'vite-plus';

const CSS_TARGETS = browserslistToTargets(
  browserslist(['edge >=115', 'chrome >=115', 'safari >=13']),
);

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
    // Stylex is not well integrated in the Vite CSS pipeline
    // https://github.com/facebook/stylex/issues/1378
    // @ts-ignore something wrong with StyleX options
    lightningcssOptions: {
      minify: true,
      targets: CSS_TARGETS,
    },
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
      targets: CSS_TARGETS,
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

  // Vite+ config
  fmt: {
    printWidth: 80,
    singleQuote: true,
    overrides: [
      {
        files: ['*.css'],
        options: {
          singleQuote: false,
        },
      },
    ],
    experimentalSortPackageJson: false,
    experimentalSortImports: {
      newlinesBetween: true,
      partitionByComment: true,
      groups: [
        ['value-builtin', 'type-builtin'],
        ['value-external', 'value-internal', 'type-external', 'type-internal'],
        [
          'value-parent',
          'value-sibling',
          'value-index',
          'type-parent',
          'type-sibling',
          'type-index',
        ],
        ['style'],
      ],
    },
    ignorePatterns: [
      '**/node_modules',
      '**/dist',
      '**/src/generated/**/*.ts',
      '**/src-tauri/target/**/*',
      '**/src-tauri/gen/**/*',
    ],
  },
  lint: {
    plugins: [
      'eslint',
      'typescript',
      'unicorn',
      'react',
      'react-perf',
      'oxc',
      'import',
      'jsx-a11y',
      'promise',
      'vitest',
    ],
    jsPlugins: ['@stylexjs/eslint-plugin'],
    ignorePatterns: [
      '**/node_modules',
      '**/dist',
      '**/src/generated/**/*.ts',
      '**/src-tauri/target/**/*',
      '**/src-tauri/gen/**/*',
    ],
    rules: {
      'typescript/no-floating-promises': [
        'warn',
        {
          allowForKnownSafeCalls: [
            {
              from: 'package',
              name: ['trace', 'debug', 'info', 'warn', 'error'],
              package: '@tauri-apps/plugin-log',
            },
          ],
        },
      ],
      '@stylexjs/valid-styles': 'error',
      '@stylexjs/no-unused': 'error',
      '@stylexjs/valid-shorthands': 'error',
      '@stylexjs/enforce-extension': 'error',
      '@stylexjs/no-legacy-contextual-styles': 'error',
      '@stylexjs/sort-keys': 'off',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
