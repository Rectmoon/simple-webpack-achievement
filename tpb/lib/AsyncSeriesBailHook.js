class AsyncSeriesBailHook {
  constructor() {
    this.tasks = []
  }

  tapAsync(name, task) {
    this.tasks.push(task)
  }

  callAsync(...args) {
    const callback = args.pop()
    let i = 0
    const next = data => {
      if (i === this.tasks.length || data) return callback()
      this.tasks[i++](...args, next)
    }
    next()
  }
}

const hook = new AsyncSeriesBailHook()

hook.tapAsync('h5', (name, cb) => {
  setTimeout(() => {
    console.log('h5', name)
    cb()
  }, 1000)
})

hook.tapAsync('pc', (name, cb) => {
  setTimeout(() => {
    console.log('pc', name)
    cb(1)
  }, 500)
})

hook.tapAsync('java', (name, cb) => {
  setTimeout(() => {
    console.log('java', name)
    cb()
  }, 1000)
})

hook.callAsync('大彪', () => {
  console.log('end')
})
