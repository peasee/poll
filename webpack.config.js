"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
require('dotenv').config({ path: __dirname + '/.env' });

let index = fs.readFileSync(path.resolve(__dirname, "public", "index.example.html"), "utf8");
index = index.replace("reCAPTCHA_site_key", process.env.RECAPTCHA_SITE_KEY ?? "");
fs.writeFileSync(path.resolve(__dirname, "public", "index.html"), index);

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
      "API_HOST": `"${process.env.API_HOST}"`,
      "RECAP_SITE_KEY": `"${process.env.RECAPTCHA_SITE_KEY ?? ''}"`
    })
  ]
};