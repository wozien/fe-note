# 响应式原理

当影响页面的数据发生改变，以往我们需要手动操作DOM来显示最新视图。通过Vue编程，我们只需重点关注数据状态的逻辑处理，Vue会帮我们自动完成视图的渲染工作，这就是Vue的数据响应式机制。现在，我们通过源码来看看Vue的响应式原理。
	
## 整体流程

在看源码之前，应该要对Vue的响应式原理有个大概了解。当我们把一个普通的对象传入作为实例的``data``选项，Vue会遍历这个对象的所有属性，利用``Object.defineProperty``把这些属性全部转为``getter/setter``。

在获取对象属性值的时候，会触发该属性的``getter``，这时候的工作是收集该属性的依赖，这里的依赖可以理解为用到这个属性的地方，可以是视图模版，监听属性或者计算属性，在Vue中抽象成一个``Watcher``类来维护，所以我们说的依赖就是``Watcher``实例。

在对象属性赋值的时候，会触发该属性的``setter``，这时候的工作是通知该属性的依赖，执行``watcher``的相关处理，比如组件重新渲染或者``watch``的回调函数。

在Vue的响应式原理中也做了很多优化的处理，比如对数组的响应处理，执行``watcher``时机等等，我们稍后在源码中会做分析。所以，响应原理的流程可以总结成下图：

<img src="http://blog.inoob.xyz/posts/1d890dd2/1.png"/>

## Observe

我们知道对``data``数据的处理是在``vm._init``入口的``initState()``方法，该方法是对实例状态的初始化工作，包括初始化``props``，``method``，``data``和监听``watch``等。我们重点关注初始化``data``的方法``initData()``，它定义在``src/core/instance/state.js``中：

```js
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // 不是以$和_开头
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  observe(data, true /* asRootData */)
}
```

这个方法首先判断``data``对象是否和``props``和``methods``存在同名的key，然后把``data``代理到``vm``实例上，所有我们就可以通过``vm.key``访问``data``的数据。最后，调用``observe()``方法把``data``转为一个响应式数据。来看下``observe``方法的定义：

```js
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

这个方法定义在``src/core/observer/index.js``。它主要通过新建一个``Observe``实例把value值转为一个响应的数据，并把实例存在对象的``__ob__``属性，我们后续的其他处理会用到。现在来看下``Observe``类：

```js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()   // 对象的依赖
    this.vmCount = 0   // 根实例数
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // .. 数组方法的拦截处理
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 遍历对象属性，处理getter/setter
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  // 循环数组元素observe
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

这个方法也很简单，如果对象是一个数组，则循环数组每个元素进行``observe``转为响应数据。如果是对象，则遍历属性利用``defineReactive``方法处理``getter/setter``。这里我们先省略对数组的拦截方法的处理，先来看下``defineReactive``方法:

```js
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 依赖管理类
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      
      // ..进行依赖收集
      
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // ...通知依赖
    }
  })
}
```

这个方法就是对``Object.defineProperty``方法设置对象属性的``getter/setter``的一个封装。需要考虑的点就是不要忽略对象属性原本的``getter/setter``。另外，方法一开始还新建了一个Dep类实例，它是对依赖进行管理的一个类。比如我们要记录每个属性的所有依赖，肯定要用一个数组来维护。所以``Dep``类的subs属性就是依赖的队列，我们来看下这个类几个重要的属性和方法:

```js
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    // Dep.target 是指正在被收集的watcher
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```

这个方法定义在``src/core/observer/dep.js``。``depend()``方法是把依赖加入到subs数组，``notify()``方法是循环数组，执行依赖的``update``方法。我们上面说了依赖就是一个``watcher``实例，所以就是调用``watcher``的``update``方法，其中``Dep.target``这个静态属性很重要，它表示此时正在执行``get``方法的``watcher``，为什么要这样记录。稍后我们在看依赖收集过程就会恍然大悟。

## 依赖收集

我们现在来看下``defineReactive``方法处理``getter``中的依赖收集过程:

```js
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  // ...

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    }
  })
}
```

在设置``getter``前，如果属性值是一个对象，应该递归把对象也转为响应数据，并获取值的``__ob__``属性。然后判断``Dep.target``有值，就调用``depend()``方法进行依赖收集，注意的是属性值的``Observe``实例也要进行依赖收集，这是为我们后面数组的响应处理和全局``set``方法时能获取到依赖做铺垫。

那什么时候``Dep.target``有值呢，那就是当新建一个``watcher``并执行它的``get``方法的时候。我们先来简单看下Watcher类的定义:

```js
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
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
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
       // 对deep深度的监听
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
}
```

在``Watcher``构造函数里面先对属性一些初始值，最后在一般情况都会直接调用``this.get()``。在``get``方法里面，先把当前``watcher``实例存到全局静态变量，然后执行``getter``方法。看到这里，在回到我们之前的组件渲染``watcher``的定义:

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}

new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

很明显，``updateComponent``会作为``watcher``的``getter``被执行，并且在执行过程中，对于访问到的``data``属性，会触发相应的``getter``进行依赖收集，这时候的``Dep.target``就是当前的渲染``watcher``。所以在vue组件模版中用到的``data``属性的依赖列表中都会包含该渲染``watcher``。

在``get``方法的最后会把全局``watcher``进行恢复。什么意思？来看下``pushTarget``和``popTarget``的定义:

```js
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

在处理``watcher``的时候，如果发现有新的``watcher``生成，会先把老的``watcher``押入栈，待新的``watcher``被收集完后，再进行恢复。最后执行``cleanupDeps``方法，维护该``watcher``最新的依赖情况，也就是``watcher``被收集进哪些Dep实例中：

```js
cleanupDeps () {
  let i = this.deps.length
  while (i--) {
    const dep = this.deps[i]
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this)
    }
  }
  let tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
}
```

``watcher``用``depIds``和``deps``记录上一次的收集情况，用``newDepIds``和``newDeps``记录本次被收集的情况。这样做的目前为了处理``v-if``动态显示模版的情况：

```html
<template>
  <div class="app">
    <div v-if="flag">
      {{ var1 }}
    </div>
    <div v-else>
      {{ var2 }}
    </div>
    <button @click="handleClick">click</button>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      flag: true,
      var1: 'fisrt',
      var2: 'second'
    };
  },
  methods: {
    handleClick() {
      this.flag = false;
      this.var1 = 'change';
    }
  }
};
</script>
```

当组件初始化``render``的时候，渲染``watcher``会被flag和var1作为依赖收集，点击按钮后执行handleClick，flag状态发生改变，再次组件的``render``时候，var2会收集该渲染``watcher``。你会发现，如果不进行``cleanupDeps``的话，这个时候渲染``watcher``的会被3个状态收集，但是我们这时候无论怎么修改var1状态，都不会影响视图，所以没必要执行var1里的依赖。

所以，我们知道依赖收集的时机，那就是``watcher``实例执行自身的``getter``，会把自身缓存在一个全局变量``Dep.target``，然后触发属性的``getter``进行依赖收集。

## 派发更新

我们来看一下，当组件的状态发生时，会触发状态的``setter``，这时会进行组件的派发更新。我们看下``setter``的处理过程:

```js
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter () {
     // ...
  },
  set: function reactiveSetter (newVal) {
    const value = getter ? getter.call(obj) : val
    if (newVal === value || (newVal !== newVal && value !== value)) {
      return
    }
    if (process.env.NODE_ENV !== 'production' && customSetter) {
      customSetter()
    }
    if (getter && !setter) return
    if (setter) {
      setter.call(obj, newVal)
    } else {
      val = newVal
    }
    childOb = !shallow && observe(newVal)
    dep.notify()
  }
})
```

在``setter``先处理新值的判断，如果不变就直接返回，否则回调用依赖实例dep的``notify``方法，我们该方法就是循环调用依赖实例(``watcher``)的``update``方法。我们来下看``watcher``的``update``方法:

```js
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

其他的条件逻辑先不管，对于渲染的``watcher``会执行``queueWatcher``方法:

```js
const queue: Array<Watcher> = []
let has: { [key: number]: ?true } = {}
let waiting = false
let flushing = false
let index = 0

export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // 这里的处理是循环触发watcher的情况
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // 清空watcher队列，下个tick执行
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
```

这个是Vue的一个重要的更新优化手段。它会先把触发的``watcher``放到一个去重的队列中，然后调用``nextTick(flushSchedulerQueue)``在下个tick去执行``flushSchedulerQueue``方法，我们Vue中nextTick是优先采用``Promise``微任务的形式模拟异步，这样做的目前是为了在DOM更新前触发这个异步任务，因为DOM的更新是在微任务执行完后执行。如果放在宏任务去执行``flushSchedulerQueue``的话，就会浪费最近的一轮DOM更新。

现在，来看下``flushSchedulerQueue``的定义：

```js
let circular: { [key: number]: number } = {}
export const MAX_UPDATE_COUNT = 100

function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id

  // watcher按id排序，父watcher先调用
  queue.sort((a, b) => a.id - b.id)

  // 这是循环的queue每次都重新获取长度，是为了处理循环watcher的问题
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // 循环watcher
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // ...
}
```

这个方法先把队列的``watcher``按id小到大排序，然后执行``watcher``的``run``方法，执行外后把has的标记置空。但是如果出现循环``watcher``的情况，又会重新执行``queueWatcher``方法，并在else条件逻辑中把该``watcher``插入相同``watcher``的前面，所以这个``has[id]``就不是``null``了。比如下面情况的循环``watch``：

```js
watch: {
  msg(newVal) {
    this.msg = newVal
  }
}
```

所以我们要规避这个情况的发生。在下一个tick中会调用``watcher``的``run``方法。看下这个方法：

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

``run``方法其实就是执行``watcher``的回调函数，并且要调用``get``方法获取最新的值。因此，对于组件的渲染的``watcher``，会在``get``中重新调用``updateComponent``，从而用最新的状态渲染视图。

到此，我们就走完了状态更新触发视图重新渲染的整个流程。

## 数组的处理

利用``Object.defineProperty``方法只能监测对象属性，并不能监测数组元素的修改或者添加，对于依赖数组渲染的视图就需要特殊处理了。Vue的做法就拦截响应数据中数组的原型对象，代理的对象自定义``push``，``shift``等修改数组元素的方法，并在方法通知依赖派发更新。

先来看下代理对象的定义，在``src/core/observer/array.js``中：

```js
const arrayProto = Array.prototype
// 数组拦截对象
export const arrayMethods = Object.create(arrayProto)

// 数组侦测的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    // 把数组新增的元素转为可侦测
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 通知依赖更新
    ob.dep.notify()
    return result
  })
})
```

首先，我们肯定要保存本来原型的方法定义，然后在拦截对象中先调用原来对应方法，然后获取数组的依赖实例ob，这里就是之前在``defineReactive``方法中进行递归``observe``的保存结果：

```js
let childOb = !shallow && observe(val)
```

对于新增元素的方法比如``push``，``splice``，还要获取对应的新增元素，循环进行``observe``。最后通知该数组的依赖进行更新。回到前面的``Observe``类对数组的处理:

```js
const hasProto = '__proto__' in {}

export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
    // 如果不存在_proto_,直接把方法挂载到数组上
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

某些浏览器是不支持``__proto__``属性来设置原型的，这时候Vue的处理是直接把方法挂载到数组对象上。来看下相应的处理函数：

```js
// 不存在__proto__
function protoAugment (target, src: Object) {
  target.__proto__ = src
}

function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
```

于是，我们就可以利用数组``push``等方法在修改数据的同时更新视图。

## set和delete

上面是对于数组的响应处理，其实对于对象也有对应的问题。比如，我们无法增加一个对象属性使它的值变成可侦测，另外删除属性也是不会被拦截。于是Vue增加了全局和实例上的``Vue.set``和``Vue.delete``方法来增加和删除属性，并会触发视图更新。我们先来看下set的定义:

```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 原来的key直接赋值
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 不是响应式数据也直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  // 通知订阅者
  ob.dep.notify()
  return val
}
```

对于数组，调用``splice``方法插入，因为这个方法是响应方法，所以会触发更新。对于对象，如果不是响应的对象或者key本身就在对象上面直接赋值即可。如果不是上面两种情况，证明为新增的属性并且要使它可侦测，调用``defineReactive``方法进行设置即可，最后通知对象的依赖。

对于del也类似，我们来看看：

```js
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

## 总结

Vue的响应原理其实理解起来并不复杂，它本后的设计思想就是典型的发布-订阅模式。我们数据状态可以看成是发布者，``watcher``可以看出是订阅者。当数据状态发生，发布者就会通知订阅者，执行订阅者相应的处理。

在触发更新的过程，Vue不会马上直接执行``watcher``的回调。而是把``watcher``压入到一个队列，在下个tick中再执行，这是一个很重要的优化。