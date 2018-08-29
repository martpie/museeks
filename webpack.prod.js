const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const { ui, main } = require('./webpack.common.js');


const prodConfig = {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: false
        }
      })
    ]
  }
};

const prodUiConfig = merge(ui, prodConfig);
const prodMainConfig = merge(main, prodConfig);

module.exports = [prodUiConfig, prodMainConfig];
