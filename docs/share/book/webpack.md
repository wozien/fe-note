



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

和plugin的区别： loader更加专注于文件的转化，而且plugin是扩展webpack的功能。

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

## 生产环境配置

**开启生产环境模式**

```js
// webpack.config.js
{
  mode: 'production'
}
```

**设置环境变量**

```js
{
  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('development') // 注意转为JSON字符串
    })
  ]
}
```

**source-map**

是指打包压缩后的代码映射会源代码的过程。在打包文件后面增加map文件引用

```js
//bundle.js
(function(){})({
  
})
// # sourceMappingURL = bundle.js.map
```

只有打开浏览器devtool后才去请求加载map文件

线上安全问题

- 配置成no sources-source-map, 可以打印出错误调用栈信息，但是无法显示源码
- 配置成hidden-source-map， 会生成map文件，但是不会在bundle末尾不会引用。在实践中可以上传到监控平台(比如Sentry)从而进行排查处理
- 配置成source-map， 利用nginx配置白名单，针对内网ip开放请求

**资源压缩**

config.optimization.minimize配置， webpack3使用uglifyJS压缩，webpack4采用terser

**资源缓存**

- 输出文件模版配置成 [chunkhash].js 方式来控制资源版本， 在文件内容发生变化hash值才会变化
- 利用splitChunks提取公共的模块
- html-webpack-plugin插件动态插入src

## 打包优化

**HappyPack**

开启多线程打包优化打包速度，因为webpack的loader预编译是单线程，他会根据规则对模块进行转义，转义后再去查找依赖并且递归重复上面过程，可见这个过程非常耗时。

**缩小打包作用域**

- exclude 和 include
- noParse - 不需要loader，但是会打包进bundle
- IngorePlugin - 即使被引用也不会被打包进bundle
- cache - 缓存转化结果，当内容发生变化才会重新编译

**动态连结库DllPlugin**

对于一些第三方或者不常变化的模块，可以预先编译和打包，然后在项目构建过程中直接取用。和Code Splitting的区别是，它需要单独配置一套webpack打包环境，在项目打包不需要进行额外处理，所以在打包效率上是比splitting高的。也会存在vendor模块id的问题，可以用HashedModulesPlugin解决。

**tree-shaking**

由于ESM依赖关系的构建是在编译阶段确定，webpack利用这个特性在不需要用到的代码块打上标记，然后在代码压缩插件(terser)移除这部分死代码，达到减少bundle体积的目标。

## 开发环境调优

提升效率的插件

- web pack-dashboard:用图形界面展示打包 信息
- webacpk-merge： 配置合并
- speed-measure-webpack-plugin：输出每个loader和plugin的耗时
- size-plugin：监控打包体积，和上次打包的对比

模块热替换HMR

在网页不刷新的前提下，当依赖模块代码发生变动，浏览器会自动请求变动的diff chunk， 从而在保持页面状态不变的情况下进行更新。这个过程是在本地开发环境建立一个WebSocket，当模块发生变动，会推送给前端发生改变的chunk hash信息，然后前端去请求对应的diff chunk， 至于前端怎么去更新这部分chunk，HMR暴露了一些API手动去实现，比如社区中的Vue-loader，react-hot-loader

## 其他打包工具

**Rollup**

更加专注于javscript的打包，而对于其他类型webpack支持更加全面和配置更加简约

- 更少的打包冗余代码
- 更好的tree shaking
- 支持多种规范的打包

**Parcel**

相比于webpack，它有如下几个特点

- 打包速度提升
  - 利用workder并行执行任务
  - 文件系统缓存
  - 资源编译过程优化，不同转换任务之间可以传递AST，不像webpack需要重复String到AST的过程
- 零配置  从html页面开始分支模块依赖，预置了很多配置

**打包工具趋势**

- 性能和通用性
- 配置级小化和工程标准化
- WebAssembly