const webpack = require('webpack');
const merge = require('webpack-merge');
const BabiliPlugin = require('babel-minify-webpack-plugin');

const common = require('./webpack.common.js');


module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new BabiliPlugin({}, { sourceMap: true }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ],
});
