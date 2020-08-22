const webpackMerge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const { ui, main } = require('./webpack.common.js');

const prodConfig = {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false
        }
      })
    ]
  }
};

const prodUiConfig = webpackMerge.merge(ui, prodConfig);
const prodMainConfig = webpackMerge.merge(main, prodConfig);

module.exports = [prodUiConfig, prodMainConfig];
