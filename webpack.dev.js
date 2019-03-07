const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');

const { ui, main } = require('./webpack.common.js');

const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    // new CleanTerminalPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
      },
    }),
  ],
};

const devUiConfig = merge(ui, devConfig);
const devMainConfig = merge(main, devConfig);

module.exports = [devUiConfig, devMainConfig];
