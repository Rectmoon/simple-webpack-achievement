# Webpack之Tapable
![](C:\Users\Rectmoon\Desktop\zhulingying的分享\tpb\static\5756207-aa8c5ac42dae4a69.png)

Webpack 是一个强大的静态模块打包工具，其本质是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是Tapable。Webpack中最核心的负责编译的compiler和负责创建bundle的compilation都是Tapable的实例。

查阅Webpack文档 => [compiler/compilation 钩子](https://www.webpackjs.com/api/compiler-hooks/),  我们可以看到下面这些以 `Sync`、`Async` 开头，以 `Hook` 结尾的方法，这些都是 `tapable` 核心库的类，为我们提供不同的事件流执行机制，我们称为 “钩子”。

```js
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook
 } = require("tapable");
```

**上面的实现事件流机制的 “钩子” 大方向可以分为两个类别，“同步” 和 “异步”，“异步” 又分为两个类别，“并行” 和 “串行”，而 “同步” 的钩子都是串行的。**



## Sync 类型的钩子

### 1.SyncHook

`SyncHook` 为串行同步执行，不关心事件处理函数的返回值，在触发事件之后，会按照事件注册的先后顺序执行所有的事件处理函数。

##### 使用

```js
// tap 订阅,  call发布
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
```

##### 模拟实现

```js
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
```



### 2.SyncBailHook

`SyncBailHook为同步串行的执行关系， 只要监听函数中有一个函数的返回值不为 undefined，则跳过剩下所有的逻辑。

##### 使用

```js
const { SyncBailHook } = require('tapable')

class SyncBailHookDemo {
  constructor() {
    this.hooks = {
      emit: new SyncBailHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.emit.tap('eat', function(name) {
      console.log('吃饭', name)
    })

    this.hooks.emit.tap('sleep', function(name) {
      console.log('睡觉', name)
      return '123'
    })

    this.hooks.emit.tap('doudou', function(name) {
      console.log('打豆豆', name)
    })
  }

  run() {
    this.hooks.emit.call('xiaoming')
  }
}

const demo = new SyncBailHookDemo()

demo.init()
demo.run()
```

##### 模拟实现

```js
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
```

### 3.SyncWaterfallHook

SyncWaterfallHook 为同步串行的执行关系，上一个监听函数的返回值可以传给下一个监听函数。

##### 使用

```js
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
```

##### 模拟实现

```js
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
```

### 4.SyncLoopHook

SyncLoopHook为同步循环的执行关系，当监听函数被触发的时候，如果该监听函数返回值不为 undefined,则这个监听函数会反复执行。

##### 使用

```js

const { SyncLoopHook } = require('tapable')

class SyncLoopHookDemo {
  constructor() {
    this.index = 0
    this.hooks = {
      target: new SyncLoopHook(['name'])
    }
  }
  init() {
    this.hooks.target.tap('eat', name => {
      console.log('吃饭', name)
      return ++this.index === 3 ? undefined : true
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

const demo = new SyncLoopHookDemo()

demo.init()
demo.run()
```

##### 模拟实现

```js
class SyncLoopHook {
    constructor() {
        this.tasks = []
    }

    tap(name, task) {
        this.tasks.push(task)
    }

    call(...args) {
        this.tasks.forEach(task => {
            let result
            do {
                result = task(...args)
            } while (result !== undefined)
        })
    }
}

let hook = new SyncLoopHook()

let total = 0

hook.tap("eat", function(name) {
    console.log("吃饭", name, total + 1)
    return ++total === 3 ? undefined : true
})

hook.tap("sleep", function(data) {
    console.log("睡觉", data)
})

hook.tap("doudou", function(data) {
    console.log("打豆豆", data)
})

hook.call("小王")
```

## Async 类型的钩子

Async 类型可以使用 tap、tapSync 和 tapPromise 注册不同类型的插件 “钩子”，分别通过 call、callAsync 和 promise 方法调用。

### 1.AsyncParallelHook

异步并发执行。

##### 使用

```js

const { AsyncParallelHook } = require('tapable')

class AsyncParallelHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncParallelHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tapAsync('h5', (name, cb) => {
      setTimeout(() => {
        console.log('h5', name)
        cb()
      }, 2000)
    })

    this.hooks.target.tapAsync('pc', (name, cb) => {
      setTimeout(() => {
        console.log('pc', name)
        cb()
      }, 500)
    })

    this.hooks.target.tapAsync('java', (name, cb) => {
      setTimeout(() => {
        console.log('java', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('lzx', function() {
      console.log('end')
    })
  }
}

const demo = new AsyncParallelHookDemo()

demo.init()
demo.run()
```

##### 模拟实现

```js
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
     this.tasks.push(task);
  }
    
  promise(...args) {
     return Promise.all(this.tasks.map(task => task(...args)));
  }
}

const hook = new AsyncParallelHook()

hook.tapAsync('h5', (name, cb) => {
  setTimeout(() => {
    console.log('h5', name)
    cb()
  }, 2000)
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

hook.callAsync('lzx', () => {
  console.log('end')
})
```

### 2.AsyncSeriesHook

异步串行执行，与 `AsyncParallelHook` 相同。

##### 使用

```js
const { AsyncSeriesHook } = require('tapable')

class AsyncSeriesHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncSeriesHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tapAsync('h5', function(name, cb) {
      setTimeout(() => {
        console.log('h5', name)
        cb()
      }, 3000)
    })

    this.hooks.target.tapAsync('pc', function(name, cb) {
      setTimeout(() => {
        console.log('pc', name)
        cb()
      }, 1000)
    })

    this.hooks.target.tapAsync('java', function(name, cb) {
      setTimeout(() => {
        console.log('java', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('xiaoming', () => {
      console.log('end')
    })
  }
}

const demo = new AsyncSeriesHookDemo()

demo.init()
demo.run()
```

##### 模拟实现

```js
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
     this.tasks.push(task);
  }
    
  promise(...args) {
      let [first, ...others] = this.tasks;
      return others.reduce((promise, task) => {
            return promise.then(() => task(...args));
      }, first(...args));
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
```

### 3.AsyncSeriesWaterfallHook

异步串行执行，上一个监听函数的中的callback(err, data)的第二个参数,可以作为下一个监听函数的参数

##### 使用

```js
const { AsyncSeriesWaterfallHook } = require('tapable')

class AsyncSeriesWaterfallHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncSeriesWaterfallHook(['name'])
    }
  }
  // 注册监听函数
  init() {
    this.hooks.target.tapAsync('h5', (name, cb) => {
      setTimeout(() => {
        console.log('h5', name)
        cb(null, 1)
      }, 2000)
    })

    this.hooks.target.tapAsync('pc', (name, cb) => {
      setTimeout(() => {
        console.log('pc', name)
        cb(null, 2)
      }, 500)
    })

    this.hooks.target.tapAsync('java', (name, cb) => {
      setTimeout(() => {
        console.log('java', name)
        cb(null, 3)
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('lzx', function() {
      console.log('end')
    })
  }
}

const demo = new AsyncSeriesWaterfallHookDemo()

demo.init()
demo.run()
```

##### 模拟实现

```js
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
```



### 4.AsyncParallelBailHook

异步并行

##### 使用

```js
const { AsyncParallelBailHook } = require('tapable')

class AsyncParallelBailHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncParallelBailHook(['name'])
    }
  }

  init() {
    this.hooks.target.tapAsync('h5', function(name, cb) {
      setTimeout(() => {
        console.log('h5', name)
        cb(666)
      }, 2000)
    })

    this.hooks.target.tapAsync('pc', function(name, cb) {
      setTimeout(() => {
        console.log('pc', name)
        cb()
      }, 1000)
    })

    this.hooks.target.tapAsync('web', function(name, cb) {
      setTimeout(() => {
        console.log('web', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('小刚', () => {
      console.log('end')
    })
  }
}

const demo = new AsyncParallelBailHookDemo()
demo.init()
demo.run()
```

##### 模拟实现

```js
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
```

### 5.AsyncSeriesBailHook

异步串行执行，遇到回调传递参数不为undefined， 则忽略其他监听函数执行，直接执行callAsync回调。

##### 使用

```js
const { AsyncSeriesBailHook } = require('tapable')

class AsyncSeriesBailHookDemo {
  constructor() {
    this.hooks = {
      target: new AsyncSeriesBailHook(['name'])
    }
  }

  init() {
    this.hooks.target.tapAsync('h5', function(name, cb) {
      setTimeout(() => {
        console.log('h5', name)
        cb()
      }, 1000)
    })

    this.hooks.target.tapAsync('pc', function(name, cb) {
      setTimeout(() => {
        console.log('pc', name)
        cb(123)
      }, 1000)
    })

    this.hooks.target.tapAsync('web', function(name, cb) {
      setTimeout(() => {
        console.log('web', name)
        cb()
      }, 1000)
    })
  }

  run() {
    this.hooks.target.callAsync('小刚', () => {
      console.log('end')
    })
  }
}

const demo = new AsyncSeriesBailHookDemo()
demo.init()
demo.run()
```

##### 模拟实现

```js
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
```



总结: 

|          钩子名           | 执行方式 |                           **要点**                           |
| :-----------------------: | :------: | :----------------------------------------------------------: |
|         SyncHook          | 同步串行 |                    不关心监听函数的返回值                    |
|       SyncBailHook        | 同步串行 | 只要监听函数中有一个函数的返回值不为 undefined , 则跳过剩下所有的逻辑 |
|     SyncWaterfallHook     | 同步串行 |         上一个监听函数的返回值可以传给下一个监听函数         |
|       SyncLoopHook        | 同步循环 | 当监听函数被触发的时候,如果该监听函数返回 值不为undefined, 则这个监听函数会反复执行, 否则退出循环 |
|     AsyncParallelHook     | 异步并发 |                    不关心监听函数的返回值                    |
|   AsyncParallelBailHook   | 异步并发 | 只要监听函数的返回值不为 `null` ,就直接跳跃到 `callAsync` 等触发函数绑定的回调函数,然后执行这个被绑定的回调函数 |
|      AsyncSeriesHook      | 异步串行 |                   不关心 `callback` 的参数                   |
|    AsyncSeriesBailHook    | 异步串行 | `callback()` 的参数不为 `null` ,就会忽略其他回调，直接执行 `callAsync` 等触发函数绑定的回调函数。 |
| AsyncSeriesWaterfalllHook | 异步串行 | 上一个监听函数中的 `callback(err,data)` 的第二个参数,可以作为下一个监听函数的参数 |
