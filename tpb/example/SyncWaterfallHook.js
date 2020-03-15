/**
 * SyncWaterfallHook 为同步串行的执行关系，上一个监听函数的返回值可以传给下一个监听函数。
 */

const { SyncWaterfallHook } = require('tapable')

class SyncWaterfallHookDemo {
  constructor() {
    this.hooks = {
      target: new SyncWaterfallHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tap('eat', function(name) {
      console.log('吃饭', name)
      return '今天吃了黄焖鸡米饭'
    })

    this.hooks.target.tap('sleep', function(data) {
      console.log('睡觉', data)
      return '晚安'
    })

    this.hooks.target.tap('doudou', function(data) {
      console.log('打豆豆', data)
    })
  }

  run() {
    this.hooks.target.call('xiaoming')
  }
}

const demo = new SyncWaterfallHookDemo()

demo.init()
demo.run()
