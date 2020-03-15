/**
 * Sync为同步串行的执行关系
 */

const { SyncHook } = require('tapable')

class SyncHookDemo {
  constructor() {
    this.hooks = {
      target: new SyncHook(['name'])
    }
  }

  init() {
    this.hooks.target.tap('eat', function(name) {
      console.log('吃饭', name)
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

const demo = new SyncHookDemo()
demo.init()
demo.run()
