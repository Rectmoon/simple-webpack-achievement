class SyncHook {
  constructor() {
    this.tasks = []
  }

  tap(name, task) {
    this.tasks.push(task)
  }

  call(...args) {
    this.tasks.forEach(task => task(...args))
  }
}

const hook = new SyncHook()

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
