import esbuild from 'esbuild';
import cssModulesPlugin from 'esbuild-css-modules-plugin';
import postCssPlugin from 'esbuild-plugin-postcss2';
import esbuildPluginSvg from 'esbuild-plugin-svg';
// import htmlPlugin from '@chialab/esbuild-plugin-html';

import postCssImport from 'postcss-import';
import postCssNested from 'postcss-nested';

const shouldWatch = process.argv.includes('--watch');
const isProduction = !process.argv.includes('--production');

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const onWatch = (name) => {
  /** @type esbuild.WatchMode */
  const watchMode = {
    onRebuild: (_errors, results) => {
      console.log(`${name} rebuilt with ${results.errors.length} errors and ${results.warnings.length} warnings`);
    },
  };

  return watchMode;
};

/*
|--------------------------------------------------------------------------
| Main process build
|--------------------------------------------------------------------------
*/

esbuild
  .build({
    entryPoints: ['./src/main/main.ts'],
    bundle: true,
    outfile: 'dist_esbuild/main.js',
    platform: 'node',
    target: 'node16.5',
    external: ['electron'],
    watch: shouldWatch ? onWatch('main') : null,
    minify: isProduction,
    define: {
      'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
    },
  })
  .then((result) => {
    console.log('===== Main bundle built =====');
  })
  .catch(() => process.exit(1));

/*
|--------------------------------------------------------------------------
| Renderer process build
|--------------------------------------------------------------------------
*/

esbuild
  .build({
    entryPoints: ['./src/renderer/main.tsx'],
    // entryPoints: ['./src/renderer/app.html'],
    bundle: true,
    outfile: 'dist_esbuild/renderer.js',
    platform: 'browser',
    target: 'chrome91',
    external: ['electron', 'fs', 'stream', 'path', 'platform', 'assert', 'os', 'constants', 'util'],
    watch: shouldWatch ? onWatch('renderer') : null,
    minify: isProduction,
    sourcemap: !isProduction,
    define: {
      'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
    },
    plugins: [
      // htmlPlugin(),
      esbuildPluginSvg(),
      postCssPlugin.default({
        plugins: [postCssImport, postCssNested],
      }),
      cssModulesPlugin({
        inject: true,
        localsConvention: 'dashesOnly',
        v2: true,
      }),
    ],
  })
  .then(() => {
    console.log('===== Renderer bundle built =====');
  })
  .catch(() => process.exit(1));
