import fs from 'fs';
import path from 'path';

import esbuild from 'esbuild';
import postCssPlugin from 'esbuild-plugin-postcss2';
import esbuildPluginSvg from 'esbuild-plugin-svg';
import htmlPlugin from '@chialab/esbuild-plugin-html';

import postCssImport from 'postcss-import';
import postCssNested from 'postcss-nested';
import postCssUrl from 'postcss-url';

const shouldWatch = process.argv.includes('--watch'); // infinite watch loop
const isProduction = process.argv.includes('--production');
const minify = !shouldWatch && isProduction;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

// const onWatch = (name) => {
//   /** @type esbuild.WatchMode */
//   const watchMode = {
//     onRebuild: (_errors, results) => {
//       console.log(`${name} rebuilt with ${results.errors.length} errors and ${results.warnings.length} warnings`);
//     },
//   };

//   return watchMode;
// };

/*
|--------------------------------------------------------------------------
| Main process config
|--------------------------------------------------------------------------
*/

/** @type esbuild.BuildOptions */
const configMain = {
  entryPoints: ['./src/main/main.ts'],
  bundle: true,
  outfile: 'dist/main/bundle.js',
  platform: 'node',
  target: 'node16.5',
  external: ['electron'],
  // watch: shouldWatch ? onWatch('main') : null,
  incremental: shouldWatch,
  minify,
};

/*
|--------------------------------------------------------------------------
| Renderer process config
|--------------------------------------------------------------------------
*/

/** @type esbuild.BuildOptions */
let configRenderer = {
  entryPoints: ['./src/renderer/app.html'],
  bundle: true,
  assetNames: '[name]',
  outdir: 'dist/renderer',
  platform: 'browser',
  target: 'chrome91',
  external: ['electron', 'fs', 'stream', 'path', 'platform', 'assert', 'os', 'constants', 'util', 'events'],
  // watch: shouldWatch ? onWatch('renderer') : null,
  incremental: shouldWatch,
  minify,
  sourcemap: !isProduction,
  plugins: [
    htmlPlugin(),
    esbuildPluginSvg(),
    postCssPlugin.default({
      plugins: [postCssImport, postCssNested, postCssUrl({ url: 'inline' })],
      // https://github.com/martonlederer/esbuild-plugin-postcss2/pull/30
      modules: true,
      rootDir: process.cwd(),
      sassOptions: {},
      lessOptions: {},
      stylusOptions: {},
      writeToFile: true,
    }),
  ],
  loader: {
    '.eot': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.svg': 'file',
    '.ttf': 'file',
    '.png': 'file',
  },
};

/*
|--------------------------------------------------------------------------
| Bundlers (prod + dev)
|--------------------------------------------------------------------------
*/

async function bundle() {
  try {
    await Promise.all([esbuild.build(configMain), esbuild.build(configRenderer)]);
    console.log('[museeks] built');
  } catch {
    process.exit(1);
  }
}

async function bundleWatch() {
  try {
    let [resultMain, resultRenderer] = await Promise.all([esbuild.build(configMain), esbuild.build(configRenderer)]);

    console.log('[museeks] built, listening to change...');

    // Custom watcher
    // See https://github.com/martonlederer/esbuild-plugin-postcss2/issues/19
    if (shouldWatch) {
      fs.watch(path.join('.', 'src'), { recursive: true }, async (eventType, filename) => {
        console.log(`[museeks][${eventType}] ${filename}`);
        try {
          await Promise.all([resultMain.rebuild(), resultRenderer.rebuild()]);
        } catch {
          // nothing
        }
        console.log('[museeks] rebuilt');
      });
    }
  } catch {
    // nothing
  }
}

/*
|--------------------------------------------------------------------------
| Fire things up
|--------------------------------------------------------------------------
*/

shouldWatch ? bundleWatch() : bundle();
