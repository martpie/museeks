const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const { renderer, main } = require('./webpack.common.js');

/**
 * Production build overrides
 * @type {webpack.WebpackOptionsNormalized}
 */
const prodConfig = {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
        },
      }),
    ],
  },
};

const prodRendererConfig = webpackMerge.merge(renderer, prodConfig);
const prodMainConfig = webpackMerge.merge(main, prodConfig);

module.exports = [prodRendererConfig, prodMainConfig];
