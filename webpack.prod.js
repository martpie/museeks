const merge = require('webpack-merge');
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

const prodUiConfig = merge(ui, prodConfig);
const prodMainConfig = merge(main, prodConfig);

module.exports = [prodUiConfig, prodMainConfig];
