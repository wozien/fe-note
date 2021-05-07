# 计算和监听属性

在Vue的每个组件都有一个渲染``watcher``，它会被模版用到的数据作为依赖收集，在状态发生变化时，会通知该``watcher``，从而使组件重新执行``render``和``patch``，最后渲染最新的视图。组件中除了渲染``watcher``之外，还有计算属性``computed``和监听属性``watch``，它们在Vue内部也是``watcher``的一种。

## 计算属性

Vue的计算属性常用在模版，并且它的值由响应对象的属性计算而来。来看下面例子:

```html
// App.vue
<template>
  <div class="app">
    <p>{{ fullName }}</p>
    <button @click="handleClick">click</button>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      firstName: 'wozien',
      secondName: 'zhang'
    };
  },
  computed: {
    fullName() {
      return this.firstName + '-' + this.secondName;
    }
  },
  methods: {
    handleClick() {
      this.firstName = 'wozien1';
    }
  }
};
</script>
````

上面的例子其实可以用方法实现，但是计算属性和方法的区别就是具有缓存的机制，而方法在每次``render``的时候都会重新执行一遍。现在我们通过源码来看看Vue是怎么设计计算属性的。

计算属性的初始化是在``src/core/instance/state.js``中的``initComputed``函数：

```js
const computedWatcherOptions = { lazy: true }

function initComputed(vm: Component, computed: Object) {
  const watchers = vm._computedWatchers = Object.create(null)
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // 新建一个计算watcher
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // 组件的computed会在新建组件构造器是挂载到原型对象上
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```

这个方法先创建一个空对象``vm._computedWatchers``存储实例的所有计算``watcher``，然后遍历计算属性，把计算函数作为``getter``新建对应的计算``watcher``。这里和渲染``watcher``的一个区别就是它有一个配置项``{ lazy: true }``, 在构造函数会走下面逻辑：

```js
this.dirty = this.lazy 

// ...
this.value = this.lazy
  ? undefined
  : this.get()
```

很显然，新建一个计算``watcher``不会马上执行``get``方法。接下来，判断如果计算属性的key不存在实例上，会调用``defineComputed``方法定义计算属性，否则判断是否和``data``或者``props``重名。

对于组件的计算属性，调用``defineComputed``方法是在新建组件构造器是定义的，它把计算属性挂载到构造器的原型对象。这样做的目的是防止每次新建组件实例都去重新定义一遍。它定义在``Vue.extend()``中：

```js
Vue.extend = function (extendOptions: Object): Function {
  // ...
  if (Sub.options.computed) {
    initComputed(Sub)
  }

  // ...
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
```

现在来看下``defineComputed``方法的定义:

```js
// 用Object.defineProperty定义计算属性
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

这个方法主要就是把计算属性定义在target上，并且通过``createComputedGetter``方法设置getter，对于``setter``用户可以自定义否则为空函数``noop``。现在我们看下``createComputedGetter``是怎么定义的：

```js
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        // 计算属性获取最新值
        watcher.evaluate()
      }
      if (Dep.target) {
        // 让计算属性的关联的属性收集渲染watcher
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```

这个方法返回了计算属性的``getter``函数。当我们正在执行渲染``watcher``的``get``方法时，对于组件模版访问到的计算属性，就会触发这个``getter``。

首先，通过实例上``_computedWatchers``获取到计算``watcher``。如果``watcher.dirty``为``true``，就是执行``evaluate``方法：

```js
evaluate () {
  this.value = this.get()
  this.dirty = false
}
```

所以，计算``watcher``的求值会在模版``render``的时候去调用，然后把``this.dirty``设置为``false``，所以下面再次访问计算属性会直接返回之前保存的值。那么什么时候会还原成``true``呢？那当然是计算属性依赖的状态数据发生改变时，接下来我们会分析到。

另外一个注意的是，在执行计算``watcher``的``get``方法时，也就是执行计算函数。比如我们例子中的：

```js
fullName() {
  return this.firstName + '-' + this.secondName;
}
```

在执行这个函数时，用到的firstName和secondName状态会触发``getter``，然后把fullName的计算``watcher``作为依赖进行收集。在计算属性求完值后，会执行下面逻辑：

```js
if (Dep.target) {
  // 让计算属性的关联的属性收集渲染watcher
  watcher.depend()
}

// watcher.js
depend () {
  let i = this.deps.length
  while (i--) {
    this.deps[i].depend()
  }
}
```

这端代码的意思就是让计算属性依赖的状态收集当前的``Dep.target``。很明显，当前的``Dep.target``就是组件的渲染``watcher``。所以我们的例子的firstName和secondName都有两个依赖，分别是计算``watcher``和渲染``watcher``。这样我们的组件就渲染结束，接下来就看看当计算属性的依赖状态发生改变时Vue的处理。

比如我们例子点击后会触发``this.firstName = 'wozien1'``，然后会执行firstName状态的``setter``通知依赖，调用依赖的``update``方法：

```js
// watcher.js
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    // 计算属性watcher的更新把dirty设为true
    // 在执行渲染watcher的时候获取最新的值
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

对于第一个依赖是计算``watcher``，它的``lazy``为``true``，所以只是简单的把``dirty``重新设置为``true``就结束了。然后到了渲染``watcher``，它会执行``queueWatcher(this)``在下个tick中执行``run``方法：

```js
run () {
  if (this.active) {
    // 获取新值
    const value = this.get()
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      const oldValue = this.value
      this.value = value
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          handleError(e, this.vm, `callback for watcher "${this.expression}"`)
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
}
```

执行``run``方法组件就会重新``render``，这个时候计算属性由于``dirty``已经重置为``true``，所以会执行``evaluate``获取最新的值来渲染视图。因此，我们的状态改变导致计算属性变化进而更新视图的流程就结束了。你会发现，如果我们的状态设置成和之前一样的值，这个时候不会触发状态``setter``，也就是计算``watcher``的``dirty``还是为``false``，所以计算属性还是缓存了之前的值。

说白了就是，如果模版中用到了计算属性，那么计算属性依赖的状态的改变必然会引起模版的变化，所以把渲染``watcher``收集进状态的dep即可。然后在触发渲染``watcher``要把计算``watcher``的缓存标记``dirty``设置为``true``，获取计算属性最新值。

## 监听属性

对于监听属性的入口是定义``src/core/instance/state.js``中的``initWatch``方法：

```js
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```

这个方法主要遍历实例的``watch``配置调用`createWatcher`方法。因为Vue允许我们为一个`watch`添加多个`handler`，所以要处理`handler`是数组的情况。

```js
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}
```

首先处理下`watch`的配置是一个对象的情况，获取对象的`handler`最后调用`vm.$watch`方法。这个方法是`stateMixins`挂载到原型上的：

```js
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
  const vm: Component = this
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  options.user = true
  const watcher = new Watcher(vm, expOrFn, cb, options)
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value)
    } catch (error) {
      handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
    }
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}
```

这个方法为实例的监听属性新建一个`watcher`。如果expOrFn是一个函数的话，它会作为`watcher`的`getter`。否则会执行下面的代码：

```js
// watcher.js
if (typeof expOrFn === 'function') {
  this.getter = expOrFn
} else {
// 字符串情况
  this.getter = parsePath(expOrFn)
  if (!this.getter) {
    this.getter = noop
    process.env.NODE_ENV !== 'production' && warn(
      `Failed watching path: "${expOrFn}" ` +
      'Watcher only accepts simple dot-delimited paths. ' +
      'For full control, use a function instead.',
      vm
    )
  }
}
```

`parsePath`方法是获取字符串形式的对象属性，并且返回一个获取的函数：

```js
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)
export function parsePath (path: string): any {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

这个方法就是把字符串按``.``切割，然后循环就可以访问到最终监听的属性。这样两种方式的监听属性的`getter`都可以拿到，在执行`getter`后就会把该`watcher`作为依赖被监听的属性收集。要注意的是，如果监听属性是一个函数，则这个函数里面访问的属性都会收集这个`watcher`。然后在状态发生改变时，就会通知这个`watcher`执行`update`，最后在下个tick中执行对应的回调函数。

接下来对于配置了`immediate`为`true`的属性，马上执行回调函数。最后返回一个可以卸载这个`watcher`的函数，卸载`watcher`主要是调用`teardown`方法：

```js
teardown () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this)
    }
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
    this.active = false
  }
}
```

这个方法首先把自己从实例中移除，然后循环从订阅的Dep中移除。因为我们的`watcher`回调函数是在下一tick执行的，也就是异步执行的。如果要求回调函数在当前的执行栈中执行，可以设置监听属性的`sync`为`true`，然后`update`方法最直接调用`run`方法，而不是丢进`watcher`队列：

```js
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    // 计算属性watcher的更新把dirty设为true
    // 在执行渲染watcher的时候获取最新的值
    this.dirty = true
  } else if (this.sync) {
    // 同步执行
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

另外一种情况，如果我们监听的是一个对象，并且我们想要对象的子属性发生变化也要触发回调函数。我们可以设置`deep`为`true`：

```js
watch: {
  obj: {
    handler: function(){},
    deep: true
  }
}
```

现在来看下Vue对`deep`处理。在执行`watcher`的`get`时候有这样一段逻辑：

```js
if (this.deep) {
  traverse(value)
}
```

`traverse`方法主要是循环访问value的属性，触发属性的`getter`，因为当前`Dep.target`指向这个监听`watcher`，所以value的属性也会收集这个`watcher`，从而子属性改变时就会触发监听的回调函数。

```js
const seenObjects = new Set()

export function traverse (val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  // 对响应式数据deep才有效
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
```

## 总结

现在，我们对Vue的所有类型的`watcher`都分析完了，其实它们的背后逻辑都是一样的。就是把`watcher`自身作为依赖收集进状态的Dep，在状态发生改变时，执行回调函数或重新渲染组件。