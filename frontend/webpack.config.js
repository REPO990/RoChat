const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify('http://localhost:3001'),
      'process.env.REACT_APP_SOCKET_URL': JSON.stringify('http://localhost:3001')
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    port: 3000,
    hot: false,
    liveReload: false,
    client: false,
    webSocketServer: false
  }
};