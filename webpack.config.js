const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


const htmlMinify = {
  html5: true,
  minifyJS: true,
  minifyCSS: true,
  removeComments: true,
  collapseWhitespace: true,
};

module.exports = function(env = {}, argv) {
  const IS_WATCH = argv.watch;
  const IS_PRODUCTION = env.production;
  const ASSET_NAME = '[name]';
  process.env.NODE_ENV = IS_PRODUCTION ? 'production' : 'development';

  const config = {};
  config.mode = process.env.NODE_ENV;

  config.entry = {
    popup: './src/popup',
    inject: './src/inject',
    content: './src/content',
    background: './src/background',
  };

  config.output = {
    publicPath: '/',
    filename: `assets/js/${ASSET_NAME}.js`,
    chunkFilename: `assets/js/${ASSET_NAME}.js`,
    path: path.resolve(__dirname, 'dist'),
  };

  config.resolve = {
    extensions: ['.ts', '.js'],
  };

  config.devtool = IS_PRODUCTION ? 'hidden-source-map' : 'source-map';

  config.stats = {
    assets: false,
    chunks: false,
    modules: false,
    children: false,
  };

  config.devServer = {
    hot: true,
    host: '0.0.0.0',
    useLocalIp: true,
    stats: config.stats,
    disableHostCheck: true,
    headers: { "Access-Control-Allow-Origin": "*" },
  };

  config.module = {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader/useable',
            options: {
              hmr: false,
            },
          },
          {
            loader: 'css-loader',
            options: {
              hmr: IS_WATCH,
              modules: true,
              localIdentName: IS_PRODUCTION ? '[hash:base64]' : '[path][name]_[local]',
            },
          },
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `[${IS_PRODUCTION ? 'hash' : 'name'}].[ext]`,
              outputPath: 'assets/images/',
            },
          },
        ]
      },
    ],
  };

  config.plugins = [
    new CheckerPlugin(),
    new CopyPlugin([
      {from: 'manifest.json'},
      {from: 'src/assets/images/icons', to: 'assets/images'},
    ]),
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      filename: './popup.html',
      template: './popup.tpl.html',
      minify: IS_PRODUCTION ? htmlMinify : false,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: './disabled.html',
      template: './disabled.tpl.html',
      minify: IS_PRODUCTION ? htmlMinify : false,
    }),
    new ProgressBarPlugin(),
  ];

  if (IS_WATCH) {
    // config.plugins.push(new webpack.HotModuleReplacementPlugin());
  } else {
    config.plugins.push(
      new webpack.BannerPlugin({
        exclude: /runtime\.js$/,
        banner: `
Name: [name]

Author: ${require('./package.json').author}
Built at: ${new Date().toISOString()}`,
      })
    );
  }

  if (!IS_WATCH && !IS_PRODUCTION) {
    config.plugins.push(new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
    }));
  }

  return config;
};
