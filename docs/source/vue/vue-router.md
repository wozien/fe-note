# Vue-Router

前端路由是构建单页面应用的关键技术，它可以让浏览器URL变化但是不请求服务器的前提下，让页面重新渲染出我们想要的结果。`Vue-Router`是Vue应用的前端路由插件，让我们来看看它的实现原理。

## 路由例子

为了可以更好的阅读源码，我们可以用一个路由的简单例子来看下关键步骤的结果：

```js
// main.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';

Vue.use(VueRouter);

const Foo = {
  template: `
  <div>
    <p>Foo</p>
    <router-link to="/foo/bar">Go to Bar</router-link>
    <router-view></router-view>
  </div>`
};

const Bar = {
  template: `<div><p>Bar</p></div>`
};

const routes = [
  {
    path: '/foo',
    component: Foo,
    children: [
      {
        path: 'bar',
        component: Bar
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

new Vue({
  el: '#app',
  render: h => h(App),
  router
});
```

对应App组件的代码：

```js
<template>
  <div class="app">
    <h1>Vue Router App</h1>
    <p>
      <router-link to="/foo">Go to foo</router-link>
    </p>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
};
</script>
```

## 插件安装

Vue为所有插件提供一个`Vue.use()`来安装注册插件，这个方法会调用插件导出对象的`install`方法，并把Vue函数作为该函数第一个参数传递。在`src/install.js`文件中是关于Vue Router的安装程序。安装的过程主要有关键的几步：

- 通过`Vue.mixin()`全局混入`beforeCreate`和`destroyed`钩子：

```js
Vue.mixin({
  beforeCreate () {
    if (isDef(this.$options.router)) {
      // new Vue 实例
      this._routerRoot = this
      this._router = this.$options.router
      this._router.init(this) // 初始化
      Vue.util.defineReactive(this, '_route', this._router.history.current)
    } else {
      this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
    }
    registerInstance(this, this)
  },
  destroyed () {
    registerInstance(this)
  }
})
```

在`beforeCreate`钩子中，对于根实例，设置`_routerRoot`为实例本身，`_router`为VueRouter实例并调用`init`方法进行初始化，然后通过`defineReactive`把`_route`属性进行响应处理，这个是路径导航导致视图渲染的关键。对于组件实例，通过父子链关系`this.$parent && this.$parent._routerRoot`设置`_routerRoot`属性。在函数最后调用`registerInstance`主要是把组件的实例和路由规则进行绑定，这个之后会知道用处。

- 在`Vue.prototype`挂载属性

```js
// 每个组件可以vm.$router获取VueRouter实例
Object.defineProperty(Vue.prototype, '$router', {
  get () { return this._routerRoot._router }
})

// 每个组件可以vm.$route获取当前的路由路径Route
Object.defineProperty(Vue.prototype, '$route', {
  get () { return this._routerRoot._route }
})
```

这就是为什么我们能在每个组件内通过`vm.$router`和`vm.$route`方法路由实例和当前路由路径的原因

- 全局注册路由组件

```js
// 全局注册router-view和router-link组件
Vue.component('RouterView', View)
Vue.component('RouterLink', Link)
```

之后我们就可以在任何组件内使用`router-link`进行路由跳转，使用`router-view`进行路由组件的挂载。

## VueRouter

在进行插件安装后，然后会声明路由配置规则，并通过`new VueRouter(options)`新建路由实例。在`src/index.js`定义VueRouter类，在构造函数中先初始化一些属性：

```js
this.app = null
this.apps = []
this.options = options
this.beforeHooks = []
this.resolveHooks = []
this.afterHooks = []
this.matcher = createMatcher(options.routes || [], this)
```

紧接着是对路由模式`mode`的处理：

```js
let mode = options.mode || 'hash'
this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false // 是否降级
if (this.fallback) {
  mode = 'hash'
}
if (!inBrowser) {
  mode = 'abstract'
}
this.mode = mode
```

它默认值为`hash`。对于设置了`history`模式，并且浏览器不支持`history.pushState`并且没有设置不允许自动降级`fallback=false`，会自动用`hash`模式替换。如果不在浏览器端会采用`abstract`，比如在node环境，它主要是用数组的方式来模拟浏览记录栈。最后根据不同的`mode`来新建History实例，它是路由切换和记录管理的类：

```js
 // 根据mode创建不同的history实例
switch (mode) {
  case 'history':
    this.history = new HTML5History(this, options.base)
    break
  case 'hash':
    this.history = new HashHistory(this, options.base, this.fallback)
    break
  case 'abstract':
    this.history = new AbstractHistory(this, options.base)
    break
  default:
    if (process.env.NODE_ENV !== 'production') {
      assert(false, `invalid mode: ${mode}`)
    }
}
```

它们都定义在`src/history`文件下，不同模式的histroy类都继承定义在`base.js`的基类。

### init

在之前路由安装中会通过在全局混入`beforeCreate`钩子并组件根实例会调用`router`实例的`init`方法：

```js
this._router.init(this) // 初始化
```

在`init`方法首先是对注册路由的Vue实例的管理：

```js
this.apps.push(app)
if (this.app) {
  return
}

this.app = app
```

在app有值的前提下，会直接返回。这是为了让路由切换相关事件的绑定只处理一次：

```js
const history = this.history

if (history instanceof HTML5History) {
  history.`transitionTo`是跳转到指定路由位置的入口，(history.getCurrentLocation())
} else if (history instanceof HashHistory) {
  const setupHashListener = () => {
    history.setupListeners()
  }
  history.transitionTo(
    history.getCurrentLocation(),
    setupHashListener,
    setupHashListener
  )
}
```

因为`history`在构造阶段已经根据不同`mode`初始化了，所以它调用不同方式进行初始根路由的跳转。`transitionTo`是跳转到指定路由位置的入口，`setupListeners`方法是监听浏览器的url变化，里面实现细节我们后文会分析。

### matcher

路由实例有一个关键的属性`matcher`，它表示一个路由匹配器，是对路由记录和新路由匹配的管理。在构造函数中通过`createMatcher`方法进行初始化：

```js
this.matcher = createMatcher(options.routes || [], this)
```

这个方法定义在`src/create-matcher.js`，它定义了一些处理路由记录的方法并最终导出一个具有`match`和`addRoutes`方法的对象：

```js
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  // 创建RouteRecord映射
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }
  
  // ...
  
  return {
    match,
    addRoutes
  }
}
```

`addRoutes`方法是添加路由配置对象，因为我们开发过程中并不是所有路由规则都是事先定义好的。主要是调用`createRouteMap`方法把`routes`路由配置规则生成路由记录并存在对应的变量中。路由记录`RouteRecord`是对我们路由配置对象的格式化对象，它的类型定义：

```js
declare type RouteRecord = {
  path: string;
  regex: RouteRegExp;
  components: Dictionary<any>;
  instances: Dictionary<any>;
  name: ?string;
  parent: ?RouteRecord;
  redirect: ?RedirectOption;
  matchAs: ?string;
  beforeEnter: ?NavigationGuard;
  meta: any;
  props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
}
```

来看下`createRouteMap`方法定义：

```js
export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  // 这里优先获取传入的存取对象
  const pathList: Array<string> = oldPathList || []
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  // 遍历每个路由配置对象, 生成对象的RouteRecord对象
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // 把通配符记录挪到最后
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}
```

这里一开始获取传入的存取对象否则新建一些默认值，这就是我们在之后可以添加路由配置的关键。接着遍历每个路由规则配置对象调用`addRouteRecord`方法。这个方法就是生成一个路由记录对象并存在对应的位置

```js
const record: RouteRecord = {
  path: normalizedPath,
  // 利用path-to-regexp库创建路径正则表达式
  regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
  components: route.components || { default: route.component },
  instances: {},
  name,
  parent,
  matchAs,
  redirect: route.redirect,
  beforeEnter: route.beforeEnter,
  meta: route.meta || {},
  props:
    route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
}

if (!pathMap[record.path]) {
  pathList.push(record.path)
  pathMap[record.path] = record
}

if (name) {
  if (!nameMap[name]) {
    nameMap[name] = record
  } 
}
```

对于嵌套的路由规则，还要遍历`chidlren`中每个路由规则并递归调用`addRouteRecord`方法：

```js
if (route.children) {
  route.children.forEach(child => {
    const childMatchAs = matchAs
      ? cleanPath(`${matchAs}/${child.path}`)
      : undefined
    addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
  })
}
```

最终，`pathList`就是所有路由规则路径的数组，`pathMap`就是路径到路由记录的映射，`nameMap`就是路由名称到路由记录的映射。

对于我们的例子，生成的结果如下：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/17/16e75ac462927e04~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp"/>

接着，我们看下`match`方法的定义。`match`方法是根据当前的`route`和响应跳转的位置`location`计算得出新的`route`。首先，要对新的跳转位置进行格式化:

```js
const location = normalizeLocation(raw, currentRoute, false, router)
```

因为我们在`route-link`的`to`属性或者`router.push`方法传的可以是一个字符串或者对象，统一把它格式化成`location`对象。对于它的类型定义：

```js
declare type Location = {
  _normalized?: boolean;
  name?: string;
  path?: string;
  hash?: string;
  query?: Dictionary<string>;
  params?: Dictionary<string>;
  append?: boolean;
  replace?: boolean;
}
```

对应有`name`属性的`location`，我们直接在`nameMap`中可以拿到对应的路由记录。然后处理下路由参数生成路由最终的路径：

```js
if (name) {
  // 根据name拿到路由记录
  const record = nameMap[name]
  if (!record) return _createRoute(null, location)

  const paramNames = record.regex.keys
    .filter(key => !key.optional)
    .map(key => key.name)

  if (typeof location.params !== 'object') {
    location.params = {}
  }

  if (currentRoute && typeof currentRoute.params === 'object') {
    for (const key in currentRoute.params) {
      if (!(key in location.params) && paramNames.indexOf(key) > -1) {
        location.params[key] = currentRoute.params[key]
      }
    }
  }

  // 生成完成的路径字符串
  location.path = fillParams(record.path, location.params, `named route "${name}"`)
  return _createRoute(record, location, redirectedFrom)
}
```

对于只有`path`属性的位置信息，必须遍历每个记录进行正则匹配，匹配到了还要提取`path`中的参数到`params`对象中：

```js
for (let i = 0; i < pathList.length; i++) {
  const path = pathList[i];
  const record = pathMap[path];
  if (matchRoute(record.regex, location.path, location.params)) {
    // 匹配成功
    return _createRoute(record, location, redirectedFrom)
  }
}
```

两种情况找到对于的路由记录后都会调用`_createRoute`方法生成路由对象`route`：

```js
function _createRoute (
  record: ?RouteRecord,
  location: Location,
  redirectedFrom?: Location
): Route {
  if (record && record.redirect) {
    return redirect(record, redirectedFrom || location)
  }
  if (record && record.matchAs) {
    return alias(record, location, record.matchAs)
  }
  return createRoute(record, location, redirectedFrom, router)
}
```

其中`redirect`和`alias`是对重定向和别名的处理，在它们里面或者正常情况都会调用`createRoute`来返回一个路由路径对象。

```js
export function createRoute (
  record: ?RouteRecord,
  location: Location,
  redirectedFrom?: ?Location,
  router?: VueRouter
): Route {
  const stringifyQuery = router && router.options.stringifyQuery

  let query: any = location.query || {}
  try {
    query = clone(query)
  } catch (e) {}

  const route: Route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery),
    matched: record ? formatMatch(record) : []
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  return Object.freeze(route)
}
```

路由对象`route`和位置信息`location`最大区别它包含一个路由规则匹配的路径信息`matched`。它通过`formatMatch`方法生成：

```js
// 构建route中matched，先父后子
function formatMatch (record: ?RouteRecord): Array<RouteRecord> {
  const res = []
  while (record) {
    res.unshift(record)
    record = record.parent
  }
  return res
}
```

很明显它会通过不断查找记录的父亲，然后丢到数组头部，所以`matched`的匹配顺序保持先父后子。这个属性在后面的视图渲染尤其重要。最终，我们的`match`方法就根据新位置信息和当前路由对象得出新的路由对象。

## history

在路由的编程导航中，我们可以通过`router.push()`方法来跳转一个新的路径并渲染新的视图。我们从入口看下整个流程。`push`是不同类型的`history`自身的实现，对于`HashHistory`的定义在`src/history/hash.js`:

```js
// 编程跳转
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(
    location,
    route => {
      pushHash(route.fullPath)
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    },
    onAbort
  )
}
```

这个方法主要调用了基类定义的`transitionTo`方法：

```js
transitionTo (
  location: RawLocation,
  onComplete?: Function,
  onAbort?: Function
) {
  const route = this.router.match(location, this.current) // 根据跳转的location计算出新的route
  this.confirmTransition(
    route,
    () => {
      // 更新route
      this.updateRoute(route)
      onComplete && onComplete(route)
      this.ensureURL()

      // fire ready cbs once
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => {
          cb(route)
        })
      }
    },
    err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => {
          cb(err)
        })
      }
    }
  )
}
```

### 导航守卫

在`transitionTo`方法中先调用`match`方法计算出新的路由对象，然后调用`confirmTransition`方法，这个方法主要是处理导航守卫的逻辑。首先会判断新的路由对象是否和老路由对象相等，相等的话会调用`aboart`函数并退出：

```js
const current = this.current;
const abort = err => {
  if (!isExtendedError(NavigationDuplicated, err) && isError(err)) {
    if (this.errorCbs.length) {
      this.errorCbs.forEach(cb => {
        cb(err);
      });
    } else {
      warn(false, 'uncaught error during route navigation:');
      console.error(err);
    }
  }
  onAbort && onAbort(err);
};
// 相同的route
if (
  isSameRoute(route, current) &&
  // in the case the route map has been dynamically appended to
  route.matched.length === current.matched.length
) {
  this.ensureURL();
  return abort(new NavigationDuplicated(route));
}
```

接着根据新老路由对象计算出需要更新，进入和离开的路由记录：

```js
const { updated, deactivated, activated } = resolveQueue(
  this.current.matched,
  route.matched
)
```

`resolveQueue`方法的定义：

```js
// 根据新旧的matched得出不同类型的RouteRecord部分
// 比如 /foo/bar 和 /foo/baz 的 matched比较
// /foo =>  updated  /foo/baz =>  activated   /foo/bar => deactivated
function resolveQueue (
  current: Array<RouteRecord>,
  next: Array<RouteRecord>
): {
  updated: Array<RouteRecord>,
  activated: Array<RouteRecord>,
  deactivated: Array<RouteRecord>
} {
  let i
  const max = Math.max(current.length, next.length)
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}
```

有了这三个变量我们就可以轻松提取路由记录对应的路由钩子，包括离开，更新或者进入的钩子：

```js
// 构建导航守卫函数队列
const queue: Array<?NavigationGuard> = [].concat(
  // 组件beforeRouteLeave钩子
  extractLeaveGuards(deactivated),
  // 全局beforeEach
  this.router.beforeHooks,
  // 组件beforeRouteUpdate钩子
  extractUpdateHooks(updated),
  // 路由配置的组件beforeEnter钩子
  activated.map(m => m.beforeEnter),
  // 解析异步组件的钩子
  resolveAsyncComponents(activated)
)
```

这个钩子函数数组会作为`runQueue`函数的参数进行调用：

```js
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}
```

这个方法从零开始遍历路由钩子，对于每个钩子都会作为`fn`函数参数调用，并且在第二个函数参数中递归调用进行下个钩子的执行逻辑，很明显第二个参数就类似我们钩子函数的`next`。`fn`是一个定义的迭代器来执行钩子函数：

```js
// 执行导航守卫钩子
const iterator = (hook: NavigationGuard, next) => {
  if (this.pending !== route) {
    return abort();
  }
  try {
    hook(route, current, (to: any) => {
      if (to === false || isError(to)) {
        // next(false) -> abort navigation, ensure current URL
        // next(false)情况
        this.ensureURL(true);
        abort(to);
      } else if (
        typeof to === 'string' ||
        (typeof to === 'object' && (typeof to.path === 'string' || typeof to.name === 'string'))
      ) {
        // next('/') or next({ path: '/' }) -> redirect
        // 在导航守卫中next重定向
        abort();
        if (typeof to === 'object' && to.replace) {
          this.replace(to);
        } else {
          this.push(to);
        }
      } else {
        // confirm transition and pass on the value
        // 执行queue中的下一个钩子
        next(to);
      }
    });
  } catch (e) {
    abort(e);
  }
};
```

这个函数很简单，它先执行我们的路由钩子函数，然后判断传给`next`函数的参数，如果是`false`的情况直接调用`abort`函数中止导航，如果是字符串还要进行跳转到新的路径，最后才成功执行下一个钩子函数。在`runQueue`方法的钩子队列执行完后会执行下面的回调逻辑：

```js
const postEnterCbs = [];
const isValid = () => this.current === route;
// 提取组件的beforeRouteEnter
const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
// 全局beforeresolve
const queue = enterGuards.concat(this.router.resolveHooks);
runQueue(queue, iterator, () => {
  if (this.pending !== route) {
    return abort();
  }
  this.pending = null;
  onComplete(route);
  if (this.router.app) {
    // 在route-view组件更新完后执行beforeRouteEnter钩子传给next函数的回调
    this.router.app.$nextTick(() => {
      postEnterCbs.forEach(cb => {
        cb();
      });
    });
  }
});
```

其中`postEnterCbs`是对`beforeRouteEnter`钩子中传给`next`回调参数的处理，它会在`$nextTick`视图渲染后执行，这个时候就能获取对应组件的实例对象。在执行完全局的`beforeresolve`钩子后，会先执行`onComplete(route)`方法执行成功的回调。在这个方法中会执行`updateRoute`来更新路由：

```js
// 更新route
updateRoute (route: Route) {
  const prev = this.current
  this.current = route
  // 修改app._route，通知视图更新
  this.cb && this.cb(route) 
  // 执行全局beforeEach
  this.router.afterHooks.forEach(hook => {
    hook && hook(route, prev)
  })
}
```

这个方法先更新`this.current`为新的路由对象，然后执行cb函数来设置注册路由的app的`_route`方法。它在`init`方法中进行定义：

```js
// init
history.listen(route => {
  this.apps.forEach((app) => {
    app._route = route
  })
})

// base.js
listen (cb: Function) {
  this.cb = cb
}
```

因为在app根实例中对`_route`进行了响应式处理，所以重新设置就会触发它的`setter`，从而就会触发它的依赖进行更新，至于这些依赖其实就是用到`route-view`组件的实例的渲染`watcher`，然后这些实例就会重新执行`render`函数，根据最新的`route`对象来计算要渲染的路由组件，最后路由出口挂载最新的视图。在`updateRoute`方法最后，会执行全局的`afterEach`钩子。

### url更新

在执行`updateRoute`方法后，还会执行传给`transitionTo`方法的成功回调。对于HashHistory对象，会执行`pushHash`方法来更新最新的路由路径：

```js
function pushHash (path) {
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}
```

这个方法先判断浏览器是否支持`pushState`，支持的话通过`getUrl`方法得到完成的url并执行`pushState`设置。否则利用`window.location.hash`来设置浏览器url的hash：

```js
// 根据path获取完成的url
function getUrl (path) {
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}

export function pushState (url?: string, replace?: boolean) {
  const history = window.history
  try {
    if (replace) {
    // 传递之前的数据对象
      const stateCopy = extend({}, history.state)
      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
    } else {
      history.pushState({ key: setStateKey(genStateKey()) }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}

export function replaceState (url?: string) {
  pushState(url, true)
}
```

这样当我们进行路由导航，浏览器的url就会更着变化。还有一种情况就是我们手动输入url，要监听响应的事件进行路由导航更新视图，对于hash类型它是在`init`中的`setupListeners`函数进行绑定：

```js
setupListeners () {
  const router = this.router
  // 监听url变化事件
  window.addEventListener(
    supportsPushState ? 'popstate' : 'hashchange',
    () => {
      const current = this.current
      if (!ensureSlash()) {
        return
      }
      // 根据最新的hash进行路由切换
      this.transitionTo(getHash(), route => {
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    }
  )
}
```

其中`ensureSlash`函数是处理不存在任何路径的情况，它会自动替换成`#/`：

```js
// 不存在hash的情况，默认为#/
function ensureSlash (): boolean {
  const path = getHash()
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path)
  return false
}
```

## 路由组件

### router-view

Vue会在`router-view`组件中根据当前的路由对象渲染出正确的组件，那这一过程是怎么实现的。直接来看下这个组件的定义的渲染函数：

```js
render(_, { props, children, parent, data }) { 
  data.routerView = true
  const h = parent.$createElement
  // 默认为defualt
  const name = props.name
  const route = parent.$route
  const cache = parent._routerViewCache || (parent._routerViewCache = {})
}
```

因为`router-view`是一个函数组件，它在渲染的过程中是不存在组件实例的。对比正常的组件渲染，它在组件占位节点的`init`钩子中新建组件实例，然后调用实例的`render`函数进行渲染。函数组件的`render`函数是在创建占位节点时候就直接执行了，也就是说当前的实例就是在`route-view`组件的环境，也就是传给函数组件`render`函数第二个参数的`parent`属性。

类比我们的例子，第一个`route-view`执行时的`parent`就是App组件的实例，第二个就是Foo组件的实例。

紧接着是计算当前`router-view`的深度，它是判断当前所在的组件的占位符vnode是否有`routerView`属性来进行判断:

```js
let depth = 0;
while (parent && parent._routerRoot !== parent) {
  // route-view所在组件环境的占位vnode
  const vnodeData = parent.$vnode && parent.$vnode.data;
  if (vnodeData) {
    if (vnodeData.routerView) {
      depth++;
    }
  }
  parent = parent.$parent;
}
data.routerViewDepth = depth;
```

比如我们例子的第二个`router-view`所在组件是Foo，所以`parent.$vnode`就是Foo组件的占位vnode，因为它是挂载在第一个`router-view`的，所以它的`routerView`为`true`，于是depth为1；

在求出深度后，就可以在当前`route`对象的匹配路径中的`matched`属性得到渲染的组件对象`components`，然后根据具体的视图名称拿到对应的组件对象：

```js
const matched = route.matched[depth]
// render empty node if no matched route
if (!matched) {
  cache[name] = null
  return h()
}

const component = cache[name] = matched.components[name]
```

然后在要挂载的组件占位vnode上的`data`设置`registerRouteInstance`函数，这个函数会在组件的`beforeCreate`钩子中调用，并且设置匹配到的路由记录的`instances`属性，这样才能在路由的`beforeRouteEnter`中拿到对应的组件实例：

```js
data.registerRouteInstance = (vm, val) => {
  // val could be undefined for unregistration
  const current = matched.instances[name]
  if (
    (val && current !== vm) ||
    (!val && current === vm)
  ) {
    matched.instances[name] = val
  }
}
```

最后返回将要挂载的组件的占位vnode:

```js
return h(component, data, children)
```

因为我们在`router-view`的`render`函数中用到了`vm.$route`属性，所以当前实例的渲染`watcher`会作为依赖进行收集，也就是说`router-view`组件所在的环境实例的`render`函数在路由切换时会重新执行。也就是为什么当我们进行路由导航时视图会更新的原因。

### router-link

`router-link`组件是用来进行跳转的全局组件，它内部的实现原理也是调用了`router.push`路由方法进行导航。来看下`render`函数：

```js
const router = this.$router
const current = this.$route
const { location, route, href } = router.resolve(
  this.to,
  current,
  this.append
)
```

首先调用`router.resolve`方法计算出新的路由对象：

```js
resolve (
  to: RawLocation,
  current?: Route,
  append?: boolean
): {
  location: Location,
  route: Route,
  href: string,
  // for backwards compat
  normalizedTo: Location,
  resolved: Route
} {
  current = current || this.history.current
  const location = normalizeLocation(
    to,
    current,
    append,
    this
  )
  const route = this.match(location, current)
  const fullPath = route.redirectedFrom || route.fullPath
  const base = this.history.base
  const href = createHref(base, fullPath, this.mode)
  return {
    location,
    route,
    href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
}
```

然后是一堆处理点击连接样式的。接着定义一个守卫函数`guardEvent`，它会在某些情况直接返回不进行导航：

```js
// 守卫函数
function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target')
    if (/\b_blank\b/i.test(target)) return
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault()
  }
  return true
}
```

然后定义连接点击的处理函数，它会根据配置判断调用`push`还是`replace`方法：

```js
const handler = e => {
  if (guardEvent(e)) {
    if (this.replace) {
      router.replace(location, noop)
    } else {
      router.push(location, noop)
    }
  }
}

const on = { click: guardEvent };
if (Array.isArray(this.event)) {
// 处理配置的其他事件
  this.event.forEach(e => {
    on[e] = handler;
  });
} else {
  on[this.event] = handler;
}
```

对于`tag`不是`a`标签的情况，还要处理`slot`里面是否有`a`标签的情况，有的话把`data`附加到它身上，否则赋值在最外层上。最后返回`tag`创建的vnode：

```js
return h(this.tag, data, this.$slots.default)
```

## 总结

到此，`Vue-Router`的源码就大致分析完了，其实里面有很多实现细节还没扣，比如怎么格式化一个`location`，怎么提取对应组件的路由钩子，滚动的处理等，但是这不影响路由变更到视图渲染的主流程。整个流程可以概括下图：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/17/16e75ac47342cf8d~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp"/>