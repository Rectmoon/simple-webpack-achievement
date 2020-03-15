const fs = require('fs')
const path = require('path')

const babylon = require('babylon')
const types = require('@babel/types')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default

const ejs = require('ejs')
const { SyncHook } = require('tapable')

class Compiler {
  constructor(config) {
    this.config = config
    this.entryId = null
    this.modules = {}
    this.entry = config.entry
    this.root = process.cwd()
    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    }
    const { plugins = [] } = this.config
    plugins.forEach(plugin => plugin.apply(this))
    this.hooks.afterPlugins.call()
  }

  run() {
    this.hooks.run.call()
    this.hooks.compile.call()
    this.buildModule(path.resolve(this.root, this.entry), true)
    this.hooks.afterCompile.call()
    this.emitFile()
    this.hooks.emit.call()
    this.hooks.done.call()
  }

  buildModule(modulePath, isEntry) {
    const source = this.getSource(modulePath)
    const moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName
    }
    const { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName))
    this.modules[moduleName] = sourceCode
    dependencies.forEach(dep => {
      this.buildModule(path.join(this.root, dep))
    })
  }

  emitFile() {
    const {
      output: { path: p, filename }
    } = this.config
    const { entryId, modules } = this
    const main = path.join(p, filename)
    const templateStr = this.getSource(path.join(__dirname, 'main.ejs'))
    const code = ejs.render(templateStr, {
      entryId,
      modules
    })
    this.assets = {}
    this.assets[main] = code
    fs.writeFileSync(main, this.assets[main])
  }

  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8')
    const {
      module: { rules }
    } = this.config
    for (let i = 0, len = rules.length; i < len; i++) {
      const rule = rules[i]
      const { test, use } = rule
      let lastIndex = use.length - 1
      if (test.test(modulePath)) {
        function task() {
          const loader = require(use[lastIndex--])
          content = loader(content)
          if (lastIndex >= 0) task()
        }
        task()
      }
    }

    return content
  }

  parse(source, parentPath) {
    const ast = babylon.parse(source)
    const dependencies = []
    traverse(ast, {
      CallExpression(p) {
        const { node } = p
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          let moduleName = node.arguments[0].value
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName)
          dependencies.push(moduleName)
          node.arguments = [types.stringLiteral(moduleName)]
        }
      }
    })
    return {
      sourceCode: generator(ast).code,
      dependencies
    }
  }
}

module.exports = Compiler
