const webpackMerge = require('webpack-merge');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');

const { renderer, main } = require('./webpack.common.js');

const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [new CleanTerminalPlugin()],
};

const devRendererConfig = webpackMerge.merge(renderer, devConfig);
const devMainConfig = webpackMerge.merge(main, devConfig);

module.exports = [devRendererConfig, devMainConfig];
