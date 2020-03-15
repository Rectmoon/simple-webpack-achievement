class SyncBailHook {
  constructor() {
    this.tasks = []
  }
  tap(name, task) {
    this.tasks.push(task)
  }
  call(...args) {
    let result,
      i = 0
    do {
      result = this.tasks[i++](...args)
    } while (result === undefined && i < this.tasks.length)
  }
}

const hook = new SyncBailHook()

hook.tap('html', function(name) {
  console.log('html', name)
})

hook.tap('css', function(name) {
  console.log('css', name)
})

hook.tap('js', function(name) {
  console.log('js', name)
})

hook.call('xiaoming')
