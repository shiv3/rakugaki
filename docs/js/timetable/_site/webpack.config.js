module.exports = {
  entry: './table.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      // { 
      //   test: /\.js$/, 
      //   exclude: /node_modules/, 
      //   loader: "babel", 
      //   query:{
      //     presets: ['es2015']
      //   }
      // }
      { test: /\.jade$/, loader: 'pug-html-loader' }
    ]
  }
};