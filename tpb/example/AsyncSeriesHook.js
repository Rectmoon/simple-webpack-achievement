/**
 * SyncWaterfallHook 为同步串行的执行关系，上一个监听函数的返回值可以传给下一个监听函数。
 */

const { AsyncSeriesHook } = require('tapable')

class AsyncSeriesHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncSeriesHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tapAsync('h5', function(name, cb) {
      setTimeout(() => {
        console.log('h5', name)
        cb()
      }, 3000)
    })

    this.hooks.target.tapAsync('pc', function(name, cb) {
      setTimeout(() => {
        console.log('pc', name)
        cb()
      }, 1000)
    })

    this.hooks.target.tapAsync('java', function(name, cb) {
      setTimeout(() => {
        console.log('java', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('xiaoming', () => {
      console.log('end')
    })
  }
}

const demo = new AsyncSeriesHookDemo()

demo.init()
demo.run()
