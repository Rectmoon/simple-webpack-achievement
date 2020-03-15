const { AsyncParallelBailHook } = require('tapable')

class AsyncParallelBailHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncParallelBailHook(['name'])
    }
  }

  init() {
    this.hooks.target.tapAsync('h5', function(name, cb) {
      setTimeout(() => {
        console.log('h5', name)
        cb(666)
      }, 2000)
    })

    this.hooks.target.tapAsync('pc', function(name, cb) {
      setTimeout(() => {
        console.log('pc', name)
        cb()
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

const demo = new AsyncParallelBailHookDemo()
demo.init()
demo.run()
