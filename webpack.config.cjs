const path = require('path');

module.exports = {
  entry: './public/js/main.js', // Entry point for your application
  output: {
    filename: 'bundle.js', // The output bundle file
    path: path.resolve(__dirname, 'public'), // Output directory
  },
  module: {
    rules: [
     {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
        },
      },
    ],
  },
  resolve: {
    fallback: {
      "http": false,
      "https": false,
      "url": false
    }
  }
};
