"use strict";

const config = require("./config.json");
const webpack = require("webpack");

module.exports = {
  entry: './web/index.jsx',
  output: {
    path: __dirname + '/dist',
    filename: "bundle.js"
  },
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  devServer: {
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(less|css)$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ]
  },
  devtool: "inline-source-map",
  plugins: [
    new webpack.DefinePlugin({
      "API_HOST": `"${config.clientAPI}"`,
      "RECAP_SITE_KEY": `"${config.recapSiteKey}"`
    })
  ]
};