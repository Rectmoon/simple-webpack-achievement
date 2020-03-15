/**
 * 异步串行执行，上一个监听函数的中的callback(err, data)的第二个参数,可以作为下一个监听函数的参数
 *
 */

class AsyncSeriesWaterfallHook {
  constructor() {
    this.tasks = []
  }

  tapAsync(name, task) {
    this.tasks.push(task)
  }

  callAsync(...args) {
    const callback = args.pop()
    let i = 0
    const next = (err, data) => {
      if (i === this.tasks.length) return callback()
      const task = this.tasks[i]
      if (i === 0) {
        task(...args, next)
      } else {
        task(data, next)
      }
      i++
    }
    next()
  }
}

const hook = new AsyncSeriesWaterfallHook()

hook.tapAsync('h5', (name, cb) => {
  setTimeout(() => {
    console.log('h5', name)
    cb(null, 'h5完成')
  }, 2000)
})

hook.tapAsync('pc', (data, cb) => {
  setTimeout(() => {
    console.log('pc', data)
    cb(null, 'pc联调完了')
  }, 500)
})

hook.tapAsync('java', (data, cb) => {
  setTimeout(() => {
    console.log('java', data)
    cb()
  }, 1000)
})

hook.callAsync('lzx', () => {
  console.log('end')
})
