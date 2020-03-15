const { AsyncSeriesBailHook } = require('tapable')

class AsyncSeriesBailHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncSeriesBailHook(['name'])
    }
  }

  init() {
    this.hooks.target.tapAsync('h5', function(name, cb) {
      setTimeout(() => {
        console.log('h5', name)
        cb()
      }, 1000)
    })

    this.hooks.target.tapAsync('pc', function(name, cb) {
      setTimeout(() => {
        console.log('pc', name)
        cb(123)
      }, 1000)
    })

    this.hooks.target.tapAsync('web', function(name, cb) {
      setTimeout(() => {
        console.log('web', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('小刚', () => {
      console.log('end')
    })
  }
}

const demo = new AsyncSeriesBailHookDemo()
demo.init()
demo.run()
