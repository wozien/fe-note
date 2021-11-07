



# webpack实战：入门、进阶与调优

## 简介

webpack是一个模块打包工具，解决脚本式导入的各种问题

- 手动维护js的加载顺序
- 浪费网络资源请求
- 全局作用域污染

相对于其他打包工具(rollup, Parcel)的特点

- 同时支持多个模块标准
- 完备的code splitting方案
- 可处理多种类型资源
-  庞大的社区，多种插件

webpack-dev-server提供两个作用

- 利用webpack打包模块
- 监听本地资源请求， 并且提供热刷新(live-reloading，区别于hmr)

## 模块打包

CommonJS

规定一个文件就是模块，模块的顶级作用域不再是全局作用域，而是模块对象自身。可以理解成在每个模块头部定义：

```js
const module = {
  exports: {}
}
const exports = module.exports
```

> 注意: module.exports 和exports不能同时使用

ESM和CommonJS区别

- 静态和动态导入
- 前者导入的是变量是动态映射，后者只是值的拷贝
- 循环依赖处理： CJS不支持， ESM可通过动态映射特性进行处理

其他模块定义

AMD，UMD等,加载npm模块获取查找node_modules对应包下面的package.json中main指定的入口文件

模块打包原理

把所有打包的接口通过key-value的形式存在一个modules作为参数传递给匿名函数，key是模块的标识，value是用一个函数包裹的模块代码，函数参数是为模块创建作用域隔离。整个modules作为匿名函数的参数，函数体是对__webpack_require__函数的定义以及执行入口模块. require函数定义大概如下：

```js
(function(modules) {
  const installedModules = {}
  function webpackRequire(moduleId) {
    if(installedModules[moduleId]) return installedModules[moduleId]
    const module = installedModules[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    }
    modules[moduleId].call(module.exports, module, module.exports, webpackRequire)
    module.loaded = true
    return module.exports
  }
  return webpackRequire('0')
})({
  '0': function(module, exports, webpackRequire) {
    const add = webpackRequire('1')
    console.log(add(1, 2))
  },
  '1': function(module, exports, webpackRequire) {
    module.exports = (a, b) => a + b
  }
})
```

## 资源输入输出

webpack会从入口文件开始检索，并将具有依赖关系的模块生成一个依赖树，最终得到一个chunk。这个chunk称为bundle。

![image-20211106162600248](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/image-20211106162600248.png)

配置资源入口

利用entry和context决定打包入口，单一入口用字符串或者数组形式，多入口可以用对象，key为chunk的名字。提取第三方依赖到一个vendor的chunk，防止修改业务代码频繁打包，可以利用splitChunk配置实现。

配置资源出口

- filename:  指定输出的bundle文件名，控制缓存的情况可以用模板语法，如[chunkhash].js
- path： 指定资源的输出目录，绝对路径
- publicPath: 指定网络资源请求的路径，有三种不同的配置方式
  - 相对路径： 相对于HTML页面， 如 ../assets'
  - /开头：  相对于当前域名， 如 '/assets'
  - HTTP形式： CDN资源访问, 如 'htttp://mycdn.com/assets'

## 预处理器

webpack本身只能处理js文件，针对其他类型的模块需要预处理器loader转换成webpack能识别的结果。

loader本质上就是一个函数。函数的输入可能是工程源文件，也可能是上一个loader转换的结果，转化的结果包含文件字符串，source map和AST。loader支持链式调用，比如

Style 标签 = style-loader(css-loader(sass-loader(SCSS)))

自定义loader：在js文件头部增加严格模式 'use strict'

```js
const loaderUtils = require('loader-utils');
const { SourceNode, SourceMapConsumer } = require('source-map');

module.exports = function(content, sourceMap) {
  const useStrictPrefix = '\'use strict\' \n\n';
  if(this.cacheable) {
    this.cacheable();
  }

  // source-map
  const options = loaderUtils.getOptions(this) || {};
  if(options.sourceMap && sourceMap) {
    const currentRequest = loaderUtils.getCurrentRequest();
    const node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
    node.prepend(useStrictPrefix);
    const result = node.toStringWithSourceMap({ file: currentRequest });
    const callback = this.async();
    callback(null, result.code, result.map.toJSON());
  }
  // 不支持source-map的情况
  return useStrictPrefix + content;
}
```

## 样式处理

样式文件提取  extract-text-wepack-plugin

样式预先处理

- SCSS： node-sass sass-loader

- LESS: less less-loader

PostCSS的作用： 通过插件的方式增强样式

- autoprefixer，自动添加浏览器厂商前缀
- stylelint：样式规则检查
- CSSNext： 使用最新的css特性，做兼容处理

CSS Modules

把CSS模块化，让CSS拥有模块的特点

- 每个CSS文件样式拥有作用域，不会和外界发生命名冲突
- 对CSS进行依赖管理，通过相对路径引入CSS文件
- 通过composes轻松复用其他CSS模块

## 代码分片(Code Splitting)

**通过入口划分代码**

对于web应用一些库或者工具不常变动，可以放到一个单独的入口：

```jsx
// webpack.config.js
entry {
    app: './app.js',
    lib: ['lib-a', 'lib-b']
}
// index.html
<script src="dist/lib.js"></script>	
<script src="dist/app.js"></script>	
```

这种方式只适用于那些接口绑定在全局对象上的库，比如JQuery，如果要去提取不同入口依赖树的公共模块这种方式配置会很复杂。于是webpack增加对应的配置来处理。

**CommonsChunkPlugin**

webpack4版本之前的配置方式。它支持单入口和多入口公共模块提取。但是存在以下几个不足：

- 一个plugin只能提取一个vendor
- 对异步模块场景不会按照我们预期工作

**optimization.SplitcChunks**

webpack4版本针对CommonsChunkPlugin问题的改进，有如下特点

- 采用声明式配置：只要满足声明条件的模块就会被提取到公共的chunk中
- 默认异步提取，可以通过chunks:true来支持所有情况的提取

默认的提取规则

- 提取后的chunk可被共享或者来自node_modules目录
- 提取后的js chunk的体积大于30kb， css chunk的体积大于50kb
- 在按需加载过程中，并行请求的资源最大值小于等于5
- 在首次加载时，并行请求的资源最大值小于等于3

默认满足上面的条件就会被提取

**资源异步加载**

当模块数量过多，资源体积过大时，可以把一些暂时用不到的模块延迟加载。在webpack主要是使用import()函数的方式， 并且返回一个promise：

```js
// utils.js
export const add = (a, b) => {
  return a + b
}
// index.js
import('./utils').then(({ add }) => {
  console.log(add(1, 2))
})
```

异步加载的原理：动态的在head插入script标签来加载异步chunk



