module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
        { test: /\.(glsl|vs|fs)$/, loader: 'shader' },
    ],
  },
  glsl: {
      chunkPath: path(__dirname,"/glsl/chunks")
  }
};
