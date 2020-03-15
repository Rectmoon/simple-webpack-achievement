class AsyncSeriesHook {
  constructor() {
    this.tasks = []
  }

  tapAsync(name, task) {
    this.tasks.push(task)
  }

  callAsync(...args) {
    const callback = args.pop()
    let i = 0
    const next = () => (this.tasks.length === i ? callback() : this.tasks[i++](...args, next))
    next()
  }

  tapPromise(name, task) {
    this.tasks.push(task)
  }

  promise(...args) {
    const [first, ...others] = this.tasks
    return others.reduce((promise, task) => promise.then(() => task(...args)), first(...args))
  }
}

const hook = new AsyncSeriesHook()

hook.tapAsync('h5', (name, cb) => {
  setTimeout(() => {
    console.log('h5', name)
    cb()
  }, 1000)
})

hook.tapAsync('pc', (name, cb) => {
  setTimeout(() => {
    console.log('pc', name)
    cb()
  }, 500)
})

hook.tapAsync('java', (name, cb) => {
  setTimeout(() => {
    console.log('java', name)
    cb()
  }, 1000)
})

hook.callAsync('小美', () => {
  console.log('end')
})

const hook2 = new AsyncSeriesHook()

hook2.tapPromise('h5', name => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('eeee', name)
      resolve()
    }, 2000)
  })
})

hook2.tapPromise('pc', name => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('ccc', name)
      resolve()
    }, 2000)
  })
})

hook2.tapPromise('java', name => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('ddd', name)
      resolve()
    }, 2000)
  })
})

hook2.promise('小美').then(() => {
  console.log('end')
})
