/**
 * SyncLoopHook为同步循环的执行关系，当监听函数被触发的时候，
 * 如果该监听函数返回值不为 undefined,则这个监听函数会反复执行。
 */

const { SyncLoopHook } = require('tapable')

class SyncLoopHookDemo {
  constructor() {
    this.index = 0
    this.hooks = {
      target: new SyncLoopHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tap('eat', name => {
      console.log('吃饭', name)
      return ++this.index === 3 ? undefined : true
    })

    this.hooks.target.tap('sleep', function(name) {
      console.log('睡觉', name)
    })

    this.hooks.target.tap('doudou', function(name) {
      console.log('打豆豆', name)
    })
  }

  run() {
    this.hooks.target.call('xiaoming')
  }
}

const demo = new SyncLoopHookDemo()

demo.init()
demo.run()
