class AsyncParallelBailHook {
  constructor() {
    this.tasks = []
  }

  tapAsync(name, task) {
    this.tasks.push(task)
  }

  callAsync(...args) {
    const callback = args.pop()
    let i = 0,
      d = false
    const done = data => {
      if (++i === this.tasks.length || data) {
        !d && callback()
        d = true
      }
    }
    this.tasks.forEach(task => task(...args, done))
  }
}

const hook = new AsyncParallelBailHook()

hook.tapAsync('h5', (name, cb) => {
  setTimeout(() => {
    console.log('h5', name)
    cb(1)
  }, 1000)
})

hook.tapAsync('pc', (name, cb) => {
  setTimeout(() => {
    console.log('pc', name)
    cb()
  }, 1000)
})

hook.tapAsync('java', (name, cb) => {
  setTimeout(() => {
    console.log('java', name)
    cb()
  }, 1000)
})

hook.callAsync('lzx', () => {
  console.log('end')
})
