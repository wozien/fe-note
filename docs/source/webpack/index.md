# Webpack 打包原理

本质上,webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时,它会递归地构建一个依赖关系图(dependency graph),其中包含应用程序需要的每个模块,然后将所有这些模块打包成一个或多个 bundle。

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/1/5/16f741d40eaf5b45~tplv-t2oaga2asx-zoom-in-crop-mark:4536:0:0:0.image" />

## 实现一个简单的模块打包器

一个简单的例子:

```js
// foo.js
export const print = (str) => {
  console.log(str)
}

// index.js
import { print } from './foo.js'

print('hello world')
```

目标是以 `index.js` 作为入口开始打包最后生成 `bundle`， 并且能在浏览器输出 'hello world'。因为 `webpack` 整个核心流程频繁地涉及到源码文件转为 AST， 这个过程需要一些 babel 相关的工具包， 具体作用如下：

```js
 # 可以从ast利用一定的规则转成对应环境的代码
 #  比如 es6 import 转为 required
"@babel/core": "^7.19.3"
"@babel/preset-env": "^7.19.4",

# 解析源文件为ast结构
"@babel/parser": "^7.19.4",
# 遍历 ast， 找到对应的节点，比如import
"@babel/traverse": "^7.19.4"
```
## 解析文件模块

这一步主要是解析文件内容，找到模块的依赖路径，最后生成模块对象。具体步骤如下：

- 用 fs 模块读取文件代码， 然后利用 `@babel/parser` 包转为 ast
- 用 `@babel/traverse` 包来遍历 ast， 找到对应 `import` 节点并获取对应的依赖路径
- 依赖路径转化处理， 为了可以后续递归解析依赖模块可以正常的读取文件内容，并存到依赖映射`dependecies` 中
- 把 `import` 模块导入转化为 `require` 方式，做到统一模块规范
- 最后返回固定格式的模块对象

对应的代码如下：

```js
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

/**
 * 根据模块的路径解析文件，返回格式化后的模块描述
 * @param {*} filepath 
 * @returns 
 */
const parseModule = (filepath) => {
  const content = fs.readFileSync(filepath, 'utf8')
  
  const ast =  parser.parse(content, {
    sourceType: 'module'
  })
  
  // dependecies 为模块相对路径到解析后模块id的映射
  const dependecies = {}
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filepath)
      dependecies[node.source.value] = path.resolve(dirname, node.source.value)
    }
  })
  
  // 转为 CMD 模块化规范
  const { code } = transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  })

  return {
    id: filepath,
    ast,
    dependecies,
    code
  }
}
```

## 生成依赖图谱

在解析完入口文件模块生成模块对象后，遍历并递归解析模块依赖 `dependecies` 中的依赖模块。递归结束后根据所有模块对象生成依赖图谱，可以理解为模块id到模块对象的一个映射对象。

```js
/**
 * 从入口模块开始，生成依赖图字典
 * @param {*} entry 
 * @returns 
 */
const generateGraphs = (entry) => {
  const main = parseModule(entry)
  const modules = [main]

  // 递归解析所有module
  for(let i = 0; i < modules.length; i++) {
    const moduleItem = modules[i];
    for(let [, path] of Object.entries(moduleItem.dependecies)) {
      modules.push(parseModule(path))
    }
  }

  // 生产依赖图谱
  const graphs = {}
  modules.forEach(moduleItem => {
    graphs[moduleItem.id] = {
      dependecies: moduleItem.dependecies,
      code: moduleItem.code
    }
  })
  return graphs
}
```

可以打印下生成的图谱数据如下：

```js
{
  './src/index.js': {
    dependecies: { './foo.js': 'D:\\project\\mini-webpack\\src\\foo.js' },
    code: '"use strict";\n' +
      '\n' +
      'var _foo = require("./foo.js");\n' +
      "(0, _foo.print)('hello world');"
  },
  'D:\\project\\mini-webpack\\src\\foo.js': {
    dependecies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.print = void 0;\n' +
      'var print = function print(str) {\n' +
      '  console.log(str);\n' +
      '};\n' +
      'exports.print = print;'
  }
}

```

## 生成 bundle

编写一个可以执行模块对象代码的函数 `execModule`, 利用 `eval` 函数执行模块对应的code， 并且存到一个 exports 变量中：

```js
function execModule(moduleItem){
  const exports = {}
  eval(moduleItem.code)
  return exports
}
execModule(graphs['./src/index.js'])
```

执行会报错，显示 `require` 函数未定义， 这是肯定的。 我们可以实现一个`require` 函数， 用来获取依赖模块路径并且调用 `execModule` 函数并返回结果。

```js
function execModule(moduleItem){
  function localRequire(filepath) {
    filepath = moduleItem.dependecies[filepath]
    return execModule(modules[filepath])
  }

  const exports = {}
  ;(function(require, exports, code) {
    eval(code)
  })(localRequire, exports, moduleItem.code)
  return exports
}
```

把上述代码转为字符串， 最后通过 `fs.writeFileSync` 函数写入到配置的输出文件中：

```js
const build = (options) => {
  const { entry, output } = options
  const graphs = generateGraphs(entry)

  // execModule
  // 核心逻辑为利用eval执行每个module中代码code
  // 并且把导出的值赋给到声明的exports
  const bundle = `;(function(modules) {
    function execModule(moduleItem){
      function localRequire(filepath) {
        filepath = moduleItem.dependecies[filepath]
        return execModule(modules[filepath])
      }

      const exports = {}
      ;(function(require, exports, code) {
        eval(code)
      })(localRequire, exports, moduleItem.code)

      return exports
    }

    execModule(modules['${entry}'])
  })(${JSON.stringify(graphs)})`

  fs.writeFileSync(
    path.resolve(output.path, output.filename),
    bundle,
    'utf8'
  )
}
```

## 打包结果测试

编写打包函数：

```js
build({
  entry: './src/index.js',
  output: {
    path: 'dist',
    filename: 'bundle.js'
  }
})
```

在根目录用过node 运行执行打包函数， 最后生成的bundle文件如下：

```js
;(function(modules) {
    function execModule(moduleItem){
      function localRequire(filepath) {
        filepath = moduleItem.dependecies[filepath]
        return execModule(modules[filepath])
      }

      const exports = {}
      ;(function(require, exports, code) {
        eval(code)
      })(localRequire, exports, moduleItem.code)

      return exports
    }

    execModule(modules['./src/index.js'])
  })({"./src/index.js":{"dependecies":{"./foo.js":"D:\\project\\mini-webpack\\src\\foo.js"},"code":"\"use strict\";\n\nvar _foo = require(\"./foo.js\");\n(0, _foo.print)('hello world');"},"D:\\project\\mini-webpack\\src\\foo.js":{"dependecies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.print = void 0;\nvar print = function print(str) {\n  console.log(str);\n};\nexports.print = print;"}})
```

把生成的代码直接放到 `console` 执行，成功打印 `hello world`.

::: warning
因为是在根目录执行 `node` 命令， 所以入口文件路径为 `./src/index.js`。 相应的如果在 src 目录下， 则为 `./index.js`
:::


## 总结

通过自己实现一个简单打包器，可以总结下 webpack 的整体构建流程：

- 初始化参数：从配置文件和 Shell 语句中读取与合并参数,得出最终的参数
- 开始编译：用上一步得到的参数初始化 Compiler 对象,加载所有配置的插件,执行对象的 run 方法开始执行编译
- 确定入口：根据配置中的 entry 找出所有的入口文件
- 编译模块：从入口文件出发,调用所有配置的 Loader 对模块进行翻译,再找出该模块依赖的模块,再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
- 完成模块编译：在经过第 4 步使用 Loader 翻译完所有模块后,得到了每个模块被翻译后的最终内容以及它们之间的依赖关系。
- 输出资源：根据入口和模块之间的依赖关系,组装成一个个包含多个模块的 Chunk,再把每个 Chunk 转换成一个单独的文件加入到输出列表,这步是可以修改输出内容的最后机会。
- 输出完成：在确定好输出内容后,根据配置确定输出的路径和文件名,把文件内容写入到文件系统。


> 在以上过程中,Webpack 会在特定的时间点广播出特定的事件,插件在监听到感兴趣的事件后会执行特定的逻辑,并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。

## 参考

[深入浅出 Webpack](https://webpack.wuhaolin.cn/)

[webpack打包原理 ? 看完这篇你就懂了 !](https://juejin.cn/post/6844904038543130637#heading-9)

[Webpack4打包机制原理简析](https://juejin.cn/post/6844904007463337997)

