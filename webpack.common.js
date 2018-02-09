'use strict';

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: {
    main: ['./src/ui/main.js'],
  },
  target: 'electron-renderer',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({ use: 'css-loader' }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
        use: [{
          loader: 'url-loader',
          options: {
            name: 'fonts/[name].[ext]',
          },
        }],
      },
      {
        test: /\.(png|jpg)([?]?.*)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'img/[name].[ext]',
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
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'main.css', allChunks: true }),
    new HtmlWebpackPlugin({
      title: 'Museeks',
      template: 'src/app.html',
    }),
  ],
};
