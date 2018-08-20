const webpack = require('webpack');
const merge = require('webpack-merge');

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
};

const prodUiConfig = merge(ui, prodConfig);
const prodMainConfig = merge(main, prodConfig);

module.exports = [prodUiConfig, prodMainConfig];
