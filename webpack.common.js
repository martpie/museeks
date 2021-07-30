const path = require('path');

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/**
 * Renderer process bundle
 * @type {webpack.WebpackOptionsNormalized}
 */
const rendererConfig = {
  entry: {
    main: ['./src/renderer/main.tsx'],
  },
  output: {
    path: `${__dirname}/dist/renderer`,
    filename: 'bundle.js',
    publicPath: './',
  },
  target: 'electron-renderer',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Museeks',
      template: 'src/renderer/app.html',
    }),
    new WebpackBar({
      name: 'Renderer',
      color: 'green',
      basic: true,
    }),
  ],
};

/**
 * Main process bundle
 * @type {webpack.WebpackOptionsNormalized}
 */
const mainConfig = {
  entry: {
    main: ['./src/main/main.ts'],
  },
  resolve: {
    alias: {
      jsbi: path.resolve(__dirname, 'node_modules', 'jsbi', 'dist', 'jsbi-cjs.js'),
    },
  },
  output: {
    path: `${__dirname}/dist/main`,
    filename: 'bundle.js',
    publicPath: './',
  },
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new WebpackBar({
      name: 'Main    ',
      color: 'cyan',
      basic: true,
    }),
  ],
};

/**
 * Shared config
 * @type {webpack.WebpackOptionsNormalized}
 */
const sharedConfig = {
  resolve: {
    // mainFields: ['browser', 'main', 'module'],
    extensions: ['.mjs', '.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(ts|tsx)([?]?.*)$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
          {
            test: /\.module\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]___[hash:base64:5]',
                    exportLocalsConvention: 'dashesOnly',
                  },
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              'postcss-loader',
            ],
            exclude: path.join(__dirname, 'node_modules'),
          },
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
            include: path.join(__dirname, 'node_modules'),
          },
          {
            test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
            type: 'asset/resource',
          },
          {
            test: /\.(png|jpg|ico)([?]?.*)$/,
            type: 'asset/resource',
            exclude: /node_modules/,
          },
          {
            test: /\.svg$/,
            use: 'svg-inline-loader',
            include: path.resolve(__dirname, 'src'),
          },
          {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            type: 'asset/resource',
            include: /node_modules/,
          },
          {
            test: /\.node$/,
            use: 'node-loader',
          },
          {
            // Hotfix for iconv-lite https://github.com/ashtuchkin/iconv-lite/issues/204
            test: /node_modules[\/\\](iconv-lite)[\/\\].+/,
            resolve: { aliasFields: ['main'] },
          },
        ],
      },
    ],
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    modules: false,
    reasons: false,
  },
  plugins: [new CleanWebpackPlugin()],
};

/**
 * Exports
 */
module.exports.renderer = webpackMerge.merge(rendererConfig, sharedConfig);
module.exports.main = webpackMerge.merge(mainConfig, sharedConfig);
