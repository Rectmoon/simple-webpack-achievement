/** 异步并发 */

const { AsyncParallelHook } = require('tapable')

class AsyncParallelHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncParallelHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tapAsync('h5', (name, cb) => {
      setTimeout(() => {
        console.log('h5', name)
        cb()
      }, 2000)
    })

    this.hooks.target.tapAsync('pc', (name, cb) => {
      setTimeout(() => {
        console.log('pc', name)
        cb()
      }, 500)
    })

    this.hooks.target.tapAsync('java', (name, cb) => {
      setTimeout(() => {
        console.log('java', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('lzx', function() {
      console.log('end')
    })
  }
}

const demo = new AsyncParallelHookDemo()

demo.init()
demo.run()
