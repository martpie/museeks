var webpack           = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        main: ['./src/js/main.js']
    },
    target: 'electron',
    output: {
        path: './src/dist',
        filename: 'bundle.js',
        publicPath: './'
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
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader!sass-loader'),
                exclude: /node_modules/
            },
            {
                test: /\.(eot|woff|ttf|png|jpg)([\?]?.*)$/,
                loader: 'url-loader?limit=8192',
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ minimize: true, comments: false, compress: { warnings: false } }),
        new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }),
        new ExtractTextPlugin('main.css', { allChunks: true }),
    ]
}
