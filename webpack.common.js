

const path = require('path');

const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    publicPath: path.join(__dirname, 'dist', 'ui'),
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
    publicPath: path.join(__dirname, 'dist', 'main'),
  },
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false,
  }
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
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '/fonts/[name].[ext]',
          },
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
    ],
  }
};

/**
 * Exports
 */
module.exports.ui = merge(uiConfig, sharedConfig);
module.exports.main = merge(mainConfig, sharedConfig);
