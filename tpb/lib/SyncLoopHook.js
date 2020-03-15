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
