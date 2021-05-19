# keep-alive

当我们使用Vue的动态组件或者路由切换组件时，如果想要保存之前显示组件的状态，可以利用`keep-alive`内置组件包裹。现在通过源码来看看它的实现。

## 组件源码

`keep-alive`是Vue实现的内置组件，它和我们手写的组件一样有自己的组件配置，它定义在`src/core/components/keep-alive.js`：

```js
export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)  // 获取第一个组件节点
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      // 缓存vnode
      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```

这个组件和我们平时写的组件不同的是多了一个`abstract: true`，表示这是一个抽象组件。抽象组件的实例是不会维护它的父子关系链的，在`initLifecycle`中：

```js
let parent = options.parent
if (parent && !options.abstract) {
  // 找到不是抽象组件的父实例vm
  while (parent.$options.abstract && parent.$parent) {
    parent = parent.$parent
  }
  parent.$children.push(vm)
}
```

该组件定义了三个`include`，`exclude`和`max`三个props，分别表示该缓存的组件，和不该缓存的组件以及最多缓存个数。组件的`created`钩子定义了cache和keys分别表示缓存的数据和key。再来看看render函数：

```js
const slot = this.$slots.default
const vnode: VNode = getFirstComponentChild(slot)  // 获取第一个组件节点
const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
```

因为`keep-alive`组件可以缓存它的第一个子组件实例，所以要通过`slot`获取第一个组件节点的vnode。

```js
const name: ?string = getComponentName(componentOptions)
const { include, exclude } = this
if (
  // not included
  (include && (!name || !matches(include, name))) ||
  // excluded
  (exclude && name && matches(exclude, name))
) {
  return vnode
}
```

这段代码是拿到组件的名称判断它是否需要进行缓存。`matches`函数主要是对字符串，数组和正则表达式几种情况的匹配处理：

```js
function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}
```

接下来就是对拿到的子组件的vnode进行缓存操作：

```js
// 缓存vnode
const { cache, keys } = this
const key: ?string = vnode.key == null
  // same constructor may get registered as different local components
  // so cid alone is not enough (#3269)
  ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
  : vnode.key
if (cache[key]) {
  vnode.componentInstance = cache[key].componentInstance
  // make current key freshest
  remove(keys, key)
  keys.push(key)
} else {
  cache[key] = vnode
  keys.push(key)
  // prune oldest entry
  if (this.max && keys.length > parseInt(this.max)) {
    pruneCacheEntry(cache, keys[0], keys, this._vnode)
  }
}
```

主要的逻辑就是根据子组件的`key`是否命中缓存。如果命中缓存，则在缓存中获取vnode对应的实例，这样之前组件的状态就保留了。然后在把`key`移动到末尾，这样的操作是为了让`keys`的最后一个元素永远是最近使用的，对应第一个元素就是最久远的。如果没有命中缓存，则把vnode存进缓存数组，然后还要判断缓存的组件个数是否超过了限制，超过要删除第一个缓存的元素，这就是`keys`数组的作用。来看下`pruneCacheEntry`方法：

```js
function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}
```

删除的条件就是存在缓存并且不是当前渲染的节点。如果满足，则调用组件实例的`$destroy`方法进行卸载，然后删除对应的缓存和keys。在`render`函数最后，在vnode上标记这是一个被`keep-alive`缓存的组件：

```js
vnode.data.keepAlive = true
```

因为`keep-alive`组件是一个抽象组件，所以在最后返回的是第一个子组件的vnode。于是，`keep-alive`组件实例的patch过程其实是对包裹的子组件进行操作。

另外，`keep-alive`组件在挂载后还监听了`include`和`exclude`，当它们变化时要重新处理缓存，把不匹配的缓存调用`pruneCacheEntry`删除掉：

```js
mounted () {
  this.$watch('include', val => {
    pruneCache(this, name => matches(val, name))
  })
  this.$watch('exclude', val => {
    pruneCache(this, name => !matches(val, name))
  })
}
```

对应的`pruneCache`方法就是循环`cache`，判断它是否仍需要进行缓存：

```js
function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
```

## 组件渲染

先来看下一个例子：

```js
import Vue from 'vue';

const A = {
  template: `<p>I am A component</p>`,
  created() {
    console.log('create A');
  }
};

const B = {
  template: `<p>I am B component</p>`,
  created() {
    console.log('create B');
  }
};

new Vue({
  el: '#app',
  template: `
  <div>
       <keep-alive>
        <component :is="comp"></component>
       </keep-alive>
      <button @click="handleSwich">switch</button>
    </div>
  `,
  data: {
    comp: 'A'
  },
  methods: {
    handleSwich() {
      this.comp = this.comp === 'A' ? 'B' : 'A';
    }
  },
  components: { A, B }
});

```

利用`component`动态组件的方式来切换A和B组件，并用`keep-alive`进行缓存对组件进行缓存。首先会调用Vue实例的`patch`方法进行更新，首次渲染的vnode会调用`createElm`方法创建DOM，在该方法里面会先创建div节点的DOM，然后子vnode递归调用该函数进行创建。

在创建真实DOM的过程，如果遇到的是组件节点，会调用`createComponent`方法进行处理，从而创建组件对应的DOM。所以，当遇到`keep-alive`组件节点是就会调用该方法：

```js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      // 调用组件vnode的init钩子
      i(vnode, false /* hydrating */)
    }
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      // 把组件对应的DOM替换组件占位符
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```

这个方法会首先执行组件vnode的`init`钩子：

```js
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    // kept-alive components, treat as a patch
    const mountedNode: any = vnode // work around flow
    componentVNodeHooks.prepatch(mountedNode, mountedNode)
  } else {
    // 创建组件实例
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance // 组件占位符所在的vm
    )
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
}
```

对于首次渲染，会创建组件实例然后调用实例的`$mount`方法进行挂载，把组件对应的DOM插入到对应的占位vnode位置。在组件的挂载过程中，就会执行组件的`render`方法并进行`patch`，这个时候就会执行`keep-alive`组件的`render`函数。执行完后会把A组件的vnode存进`cache`中，然后返回A组件的vnode并调用`patch`方法。

在对A组件进行`patch`的过程，又会回到`createComponent`方法创建A组件对应的实例和获取对应的DOM。这样走下来，`patch`的过程比不用`keep-alive`组件是多了一步，但是结果是一样的。

当我们点击按钮切换到B组件是，因为响应式数据变化会触发当前实例的渲染`watcher`，也就是会重新执行`render`和`patch`。在`patch`过程，然后新老的vnode是同个节点时，会调用`patchVnode`方法进行比对，如果是组件节点的话还会先调用`prepatch`钩子：

```js
prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
  const options = vnode.componentOptions
  const child = vnode.componentInstance = oldVnode.componentInstance
  updateChildComponent(
    child,
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  )
}
```

`keep-alive`组件就是在会在`patch`调用该钩子，然后调用`updateChildComponent`方法更新`slot`等属性：

```js
if (needsForceUpdate) {
  vm.$slots = resolveSlots(renderChildren, parentVnode.context)
  vm.$forceUpdate()
}
```

在更新完`slot`后会调用`vm.$forceUpdate`强制刷新，也就是会重新执行`keep-alive`组件的`render`并进行`patch`。假设我们是点击了按钮两次，也就是说A组件被缓存了然后又从B切回A，这时候的A组件会命中缓存，并且组件的实例是从缓存中取：

```js
if (cache[key]) {
  vnode.componentInstance = cache[key].componentInstance
}
```

然后在对A组件调用`patch`过程中，发现它是和oldVnode不是同一个节点，所以调用`createComponent`方法创建A组件的DOM。这个时候走到组件节点的`init`钩子的时候会命中下面逻辑：

```js
if (
  vnode.componentInstance &&
  !vnode.componentInstance._isDestroyed &&
  vnode.data.keepAlive
) {
  // kept-alive components, treat as a patch
  const mountedNode: any = vnode // work around flow
  componentVNodeHooks.prepatch(mountedNode, mountedNode)
}
```

因为我们已经从`keep-alive`的缓存中取出组件的实例，所以不会重新去新建一个组件的实例，从而组件的状态得以维持。因为`vnode.elm`保存了之前的DOM，所以直接插入到对应的位置即可:

```js
// src/core/vdom/patch.js
if (isDef(vnode.componentInstance)) {
  initComponent(vnode, insertedVnodeQueue)
  // 把组件对应的DOM替换组件占位符
  insert(parentElm, vnode.elm, refElm)
  if (isTrue(isReactivated)) {
    reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
  }
  return true
}
```


## 生命周期

从上面可以知道命中`keep-alive`缓存的组件在执行`init`钩子的时候不会去重新新建一个实例，所以激活的时候`created`等初始化钩子就不会再调用，但是为了满足业务需求，Vue在激活组件的时候加入了`activated`和`deactivated`钩子。

在`patch`过程的最后面，也就是在vnode对应的DOM插入到父DOM后，会执行`invokeInsertHook`函数执行在`patch`过程中所有的`insert`钩子函数。对于组件节点，会执行它的`insert`钩子：

```js
insert (vnode: MountedComponentVNode) {
  const { context, componentInstance } = vnode
  // 调用组件的mounted钩子
  if (!componentInstance._isMounted) {
    componentInstance._isMounted = true
    callHook(componentInstance, 'mounted')
  }
  if (vnode.data.keepAlive) {
    if (context._isMounted) {
      queueActivatedComponent(componentInstance)
    } else {
      activateChildComponent(componentInstance, true /* direct */)
    }
  }
}
```

当组件实例的`_isMounted`为`false`，也就是还没标记挂载时调用`mounted`钩子函数。但组件的父环境还没挂载时，会调用`activateChildComponent`执行组件以及子组件的`actived`钩子：

```js
export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}
```

其中`vm._inactive`是为了让一个实例的钩子函数只调用一次。当父环境已经挂载的情况，会调用`queueActivatedComponent`方法把自身组件实例放到一个数组，然后在`nextTick`执行`activateChildComponent`方法：

```js
// src/core/observer/scheduler.js

export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false
  activatedChildren.push(vm)
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}
```

对于`deactivated`钩子，会在组件节点的`destory`钩子中进行处理：

```js
destroy (vnode: MountedComponentVNode) {
  const { componentInstance } = vnode
  if (!componentInstance._isDestroyed) {
    if (!vnode.data.keepAlive) {
      componentInstance.$destroy()
    } else {
      deactivateChildComponent(componentInstance, true /* direct */)
    }
  }
}
```

如果不是`keep-alive`下的组件直接调用实例的`$destory`方法。否则调用`deactivateChildComponent`方法执行组件以及子组件的`deactivated`钩子：

```js
export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}
```

## 总结

`keep-alive`的原理就是在``render``函数中把默认插槽的第一个组件vnode进行缓存，然后返回这个vnode。在组件进行`patch`过程中会调用`prepatch`钩子，更新`slot`内容后再执行渲染`watcher`，然后重新执行`render`函数。这个时候如果命中缓存，把缓存中的vnode对应实例直接赋值，这样在`slot`组件下次调用`init`钩子的时候跳过了新建实例的步骤，而是拿到原来的DOM直接插入。