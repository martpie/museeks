const webpack           = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const path = require('path');

module.exports = {
    entry: {
        main: ['./src/js/main.js']
    },
    target: 'electron',
    output: {
        path: './src/dist',
        filename: 'bundle.js',
        publicPath: ''
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css-loader')
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader!sass-loader')
            },
            {
                test: /\.(eot|woff|ttf)([\?]?.*)$/,
                loader: 'url-loader?name=fonts/[name].[ext]',
            },
            {
                test: /\.(png|jpg)([\?]?.*)$/,
                loader: 'file-loader?name=img/[name].[ext]',
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline',
                include: path.resolve(__dirname, 'src')
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?mimetype=image/svg+xml',
                include: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ minimize: true, comments: false, compress: { warnings: false } }),
        new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }),
        new ExtractTextPlugin('main.css', { allChunks: true }),
    ]
};
