# 组件更新

我们之前分析Vue实现组件化挂载的源码分析，知道了组件是怎么一步一步创建到挂载到真实的DOM中。现在，我们结合Vue的响应式原理，看看当状态发生变化时，组件是怎么进行更新操作的。

## 一个例子

其实，Vue的虚拟DOM的更新是模仿snabdom实现的，对于两个节点的对比过程基本一样。所以对于diff算法的分析，可以参考[VirtualDOM 的简单实现](https://www.inoob.xyz/posts/65181b95/)，我们用一个例子来跑下整个过程：

```html
// App.vue
<template>
  <div class="app">
    <p>I am App</p>
    <Hello :list="list"></Hello>
    <button @click="handleClick">change</button>
  </div>
</template>

<script>
import Hello from './Hello';

export default {
  name: 'app',
  data() {
    return {
      list: ['A', 'B', 'C', 'D']
    };
  },
  methods: {
    handleClick() {
      this.list.reverse().splice(2, 0, 'E');
    }
  },
  components: {
    Hello
  }
};
</script>
```

Hello组件：

```html
// Hello.vue
<template>
  <ul>
    <li v-for="(item, index) in list" :key="index">{{ item }}</li>
  </ul>
</template>

<script>
export default {
  props: ['list']
};
</script>
```

这个例子App组件传递一个list作为``props``给Hello组件，并且显示ABCD。当我们点击按钮的时候，列表的渲染内容会改变，最终渲染成DCEBA。你或许有个疑问，就是list是App组件的状态，当它改成的时候只会触发App的渲染``watcher``，那Vue是怎么通知到子组件，并让他也触发渲染`watcher`的呢？

## props的监听

我们知道Vue组件会对`data`状态在初始化时进行响应式处理，其实对`prop`也进行了`getter/setter`的设置，并且发生在`data`初始化之前，先来看下组件状态的初始化顺序：

```js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

初始化状态的顺序是`props`,`methods`,`data`,`computed`和`watch`，这个顺序是必要的。因为我们在`data`中能用到`prop`，在`watch`中能监听到所有状态，所以它必须在最后。在`initProps`方法就是对`props`的处理：

```js
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    // 获取props对应key的值
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }

    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```

这段代码主要是循环`props`，通过`validateProp`方法获取对应`prop`的值并且会校验类型，最后调用`defineReactive`将其转为响应式的，并且把`props`代理到实例上。`propsData`是属性的数据对象，它是在创建组件节点是就已经处理好了，在`createComponent`方法中：

```js
// 从vnode的data中提取props数据
const propsData = extractPropsFromVNodeData(data, Ctor, tag)
```

所以在我们例子的Hello组件中list发生变化，会触发自身的渲染`watcher`。现在就来看看App是怎么通知到Hello组件的。

## 组件虚拟节点更新

当我们list发生变化，会通知App组件的渲染`watcher`，然后进行`render`后更新操作。和处理挂载不同是，在执行`vm._update()`时候，因为我们之前vnode是存在的，所以会执行下面代码:

```js
// src/core/instance/lifecycle.js

Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) { 

  const prevVnode = vm._vnode

  if (!prevVnode) {
    // ...
  } else {
    // 状态发生变化，对比新老节点
    vm.$el = vm.__patch__(prevVnode, vnode)
  }

}
```

然后调用`patch`方法，这个时候的`oldVnode`不是真实的DOM节点并且和vnode是同一个节点，所以会走下面的逻辑:

```js
const isRealElement = isDef(oldVnode.nodeType) // 是否为dom节点，首次挂载为true
if (!isRealElement && sameVnode(oldVnode, vnode)) {
  // patch existing root node
  // 同一个节点进行diff
  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
}
```

`sameVnode`方法判断两个虚拟节点是否同一个节点：

```js
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```

首先两个节点的key必须全等，如果没有设置两个`undefiend`也是成立的。然后如果是同步的节点，判断tag，isComment相等，并且是同一种类型的input。如果是异步节点，判断两个异步工厂函数是否相等。我们例子中App组件的是同一个节点，所以会调用`patchVnode`方法进行两个节点的对比：

```js
function patchVnode (
  oldVnode,
  vnode,
  insertedVnodeQueue,
  ownerArray,
  index,
  removeOnly
) {
  if (oldVnode === vnode) {
    return
  }

  if (isDef(vnode.elm) && isDef(ownerArray)) {
    vnode = ownerArray[index] = cloneVNode(vnode)
  }

  const elm = vnode.elm = oldVnode.elm

  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
    } else {
      vnode.isAsyncPlaceholder = true
    }
    return
  }

  // 静态节点的处理
  if (isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    vnode.componentInstance = oldVnode.componentInstance
    return
  }

  let i
  const data = vnode.data
  // 组件占位节点调用prepatch钩子
  // 更新组件实例的props和listener等，触发组件的prop的setter
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode)
  }

  const oldCh = oldVnode.children
  const ch = vnode.children
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
  }
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(ch)
      }
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      removeVnodes(oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text)
  }
  // 调用postpatch钩子
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
  }
}
```

这个方法主要分成3部分，第一部分是调用`prepatch`钩子，前提是这个vnode是一个组件占位节点：

```js
let i
const data = vnode.data
if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
  i(oldVnode, vnode)
}
```

这带代码就是通知子组件进行更新的关键。我们来看下`prepatch`钩子函数的定义：

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

`prepatch`钩子的作用是修改子组件实例的`props`，`listeners`和`slot`。在`updateChildComponent`函数中有这么一段代码:

```js
// update props
if (propsData && vm.$options.props) {
  toggleObserving(false)
  const props = vm._props
  const propKeys = vm.$options._propKeys || []
  for (let i = 0; i < propKeys.length; i++) {
    const key = propKeys[i]
    const propOptions: any = vm.$options.props // wtf flow?
    props[key] = validateProp(key, propOptions, propsData, vm)
  }
  toggleObserving(true)
  // keep a copy of raw propsData
  vm.$options.propsData = propsData
}
```

很显然，这个时候我们的Hello组件的list已经修改成了新的状态。由于Vue对`prop`也进行了响应式监听，所以这个时候Hello组件的渲染`watcher`会被通知，并且在App的渲染`watcher`执行完后再执行。也就是说父组件先`patch`更新DOM完后子组件才会更新。

## 子组件更新

因为我们组件的`patch`过程是一个深度优先遍历的过程，当父组件更新完后，子组件才开始自己的`patch`流程，并且执行的工作和父组件一样。在我们例子中，由于list状态发生变化，所以会重新渲染。在渲染过程中，会调用`updateChildren`方法进行子节点的对比更新：

```js
if (isDef(oldCh) && isDef(ch)) {
  if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
} 
```

因为`updateChildren`方法和snabdom实现的原理一致，就不做分析。我们来结合例子看下整个过程：

第一步，oldStartIdx和newEndIdx都是A节点，在进行A节点`patch`后把移动到为处理节点的后面，也就是oldEndIdx节点的后面：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54c44f8c64b4f~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp" />

第二步，发现oldStartIdx和newEndIdx都是B节点,过程和第一步一样：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54c44f8dc93df~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp" />

第三步，oldEndIdx和newStartIdx都是D节点，更新后把D节点移动后未处理节点的前面，也就是oldStartIdx的前面：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54c44f8a4b7b1~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp" />

第四步，oldStartIdx和newStartIdx都是C节点，不用进行移动

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54c44f8bafcd3~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp" />

第五步，这时候发现oldStartIdx已经大于oldEndIdx，也就是说如果新的节点还有为处理，那么都是新增的节点，对应我们的E节点。这个时候把所有未处理的节点插入到newEndIdx后面一个节点的前面，也就是把E插在B节点的前面：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54c44f8d2d594~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp" />


## 总结

到此，结合前面的文章，我们就从源码的角度分析完Vue组件状态的改变到视图更新的全部流程，可以总结成下面一张图：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54c44f8e5bf7f~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp" />