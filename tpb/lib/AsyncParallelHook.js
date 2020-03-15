class AsyncParallelHook {
  constructor() {
    this.tasks = []
  }

  tapAsync(name, task) {
    this.tasks.push(task)
  }

  callAsync(...args) {
    const callback = args.pop()
    let i = 0
    const done = () => ++i === this.tasks.length && callback()
    this.tasks.forEach(task => task(...args, done))
  }

  tapPromise(name, task) {
    this.tasks.push(task)
  }

  promise(...args) {
    return Promise.all(this.tasks.map(task => task(...args)))
  }
}

const hook1 = new AsyncParallelHook()

hook1.tapAsync('h5', (name, cb) => {
  setTimeout(() => {
    console.log('h5', name)
    cb()
  }, 2000)
})

hook1.tapAsync('pc', (name, cb) => {
  setTimeout(() => {
    console.log('pc', name)
    cb()
  }, 500)
})

hook1.tapAsync('java', (name, cb) => {
  setTimeout(() => {
    console.log('java', name)
    cb()
  }, 1000)
})

hook1.callAsync('lzx', () => {
  console.log('end')
})

const hook2 = new AsyncParallelHook()

hook2.tapPromise('a', (name, cb) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('a', name)
      resolve()
    }, 2000)
  })
})

hook2.tapAsync('b', (name, cb) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('b', name)
      resolve()
    }, 2000)
  })
})

hook2.tapAsync('c', (name, cb) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('c', name)
      resolve()
    }, 2000)
  })
})

hook2.promise('lzx').then(() => {
  console.log('end')
})
