import esbuild from 'esbuild';
import cssModulesPlugin from 'esbuild-css-modules-plugin';
import postCssPlugin from 'esbuild-plugin-postcss2';
import esbuildPluginSvg from 'esbuild-plugin-svg';
// import htmlPlugin from '@chialab/esbuild-plugin-html';

import postCssImport from 'postcss-import';
import postCssNested from 'postcss-nested';

/*
|--------------------------------------------------------------------------
| Main process build
|--------------------------------------------------------------------------
*/

esbuild
  .build({
    entryPoints: ['./src/main/main.ts'],
    bundle: true,
    outfile: 'dist_esbuild/main.mjs',
    platform: 'node',
    target: 'node16.5',
    external: ['electron'],
    minify: true,
  })
  .then(() => {
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
    external: ['electron', 'fs', 'stream', 'path', 'platform', 'assert', 'os', 'constants'],
    minify: true,
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
