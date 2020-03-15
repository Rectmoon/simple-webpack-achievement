const { AsyncSeriesWaterfallHook } = require('tapable')

class AsyncSeriesWaterfallHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncSeriesWaterfallHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tapAsync('h5', (name, cb) => {
      setTimeout(() => {
        console.log('h5', name)
        cb(null, 1)
      }, 2000)
    })

    this.hooks.target.tapAsync('pc', (name, cb) => {
      setTimeout(() => {
        console.log('pc', name)
        cb(null, 2)
      }, 500)
    })

    this.hooks.target.tapAsync('java', (name, cb) => {
      setTimeout(() => {
        console.log('java', name)
        cb(null, 3)
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('lzx', function() {
      console.log('end')
    })
  }
}

const demo = new AsyncSeriesWaterfallHookDemo()

demo.init()
demo.run()
