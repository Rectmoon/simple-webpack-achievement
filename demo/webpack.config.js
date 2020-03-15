const path = require('path')

class P1 {
  apply(compiler) {
    console.log('start')
    compiler.hooks.emit.tap('emit', () => {
      console.log('emit')
    })
  }
}

class P2 {
  apply(compiler) {
    compiler.hooks.afterPlugins.tap('emit', () => {
      console.log('afterPlugins')
    })
  }
}

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [path.resolve(__dirname, 'loaders', 'style-loader'), path.resolve(__dirname, 'loaders', 'less-loader')]
      }
    ]
  },
  plugins: [new P1(), new P2()]
}
