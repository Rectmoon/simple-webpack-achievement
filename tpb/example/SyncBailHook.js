/**
 * SyncBailHook为同步串行的执行关系，
 * 只要监听函数中有一个函数的返回值不为 undefined，则跳过剩下所有的逻辑。
 */

const { SyncBailHook } = require('tapable')

class SyncBailHookDemo {
  constructor() {
    this.hooks = {
      emit: new SyncBailHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.emit.tap('eat', function(name) {
      console.log('吃饭', name)
    })

    this.hooks.emit.tap('sleep', function(name) {
      console.log('睡觉', name)
      return '123'
    })

    this.hooks.emit.tap('doudou', function(name) {
      console.log('打豆豆', name)
    })
  }

  run() {
    this.hooks.emit.call('xiaoming')
  }
}

const demo = new SyncBailHookDemo()

demo.init()
demo.run()
