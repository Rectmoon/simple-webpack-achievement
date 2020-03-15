class SyncWaterfallHook {
  constructor() {
    this.tasks = []
  }

  tap(name, task) {
    this.tasks.push(task)
  }

  call(...args) {
    const [first, ...rest] = this.tasks
    rest.reduce((a, b) => b(a), first(...args))
  }
}

let hook = new SyncWaterfallHook()

hook.tap('eat', function(name) {
  console.log('吃饭', name)
  return '今天吃了黄焖鸡米饭'
})

hook.tap('sleep', function(data) {
  console.log('睡觉', data)
  return '晚安'
})

hook.tap('doudou', function(data) {
  console.log('打豆豆', data)
})

hook.call('小王')
