

const path = require('path');

const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');

/**
 * Renderer process bundle
 */
const uiConfig = {
  entry: {
    main: ['./src/ui/main.tsx'],
  },
  output: {
    path: `${__dirname}/dist/ui`,
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
      template: 'src/app.html',
    }),
    new WebpackBar({
      name: 'UI  ',
      basic: true
    })
  ]
}

/**
 * Main process bundle
 */
const mainConfig = {
  entry: {
    main: ['./src/main/main.ts'],
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
      name: 'Main',
      color: 'yellow',
      basic: true
    })
  ]
}

/**
 * Shared config
 */
const sharedConfig = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)([?]?.*)$/,
        loader: ['ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]___[hash:base64:5]',
              camelCase: 'dashesOnly',
              sourceMap: true,
            }
          },
          'postcss-loader'
        ],
        exclude: path.join(__dirname, 'node_modules')
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
        include: path.join(__dirname, 'node_modules')
      },
      {
        test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '/fonts/[name].[ext]',
            useRelativePath: true
          }
        }],
      },
      {
        test: /\.(png|jpg|ico)([?]?.*)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]',
          },
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
        include: path.resolve(__dirname, 'src'),
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            mimetype: 'image/svg+xml',
          },
        }],
        include: /node_modules/,
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ],
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    modules: false,
    reasons: false,
  },
};

/**
 * Exports
 */
module.exports.ui = merge(uiConfig, sharedConfig);
module.exports.main = merge(mainConfig, sharedConfig);
