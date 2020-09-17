const webpackMerge = require('webpack-merge');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');

const { ui, main } = require('./webpack.common.js');

const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [new CleanTerminalPlugin()],
};

const devUiConfig = webpackMerge.merge(ui, devConfig);
const devMainConfig = webpackMerge.merge(main, devConfig);

module.exports = [devUiConfig, devMainConfig];
