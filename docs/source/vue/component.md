# 组件化

组件化是Vue的核心概念，它让我们提取可复用的模版和脚本，在需要用到的地方插入对应的组件标签。那Vue是怎么把组件渲染成真实的DOM的呢，它和我们渲染普通的HTML有啥区别？我们在上篇文章中实例插入一个组件，通过源码分析组件怎么渲染？

## 组件虚拟节点

我们通过``new Vue()``插入一个组件节点：

```html
// App.vue
<template>
  <div class="app">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      msg: 'Hello Vue'
    };
  }
};
</script>
```

在入口文件挂载：

```js
import Vue from 'vue';
import App from './App.vue';

new Vue({
  el: '#app',
  render: h => h(App)
});
```

从上篇分析``new Vue()``的主流程后，我们知道vue实例会调用``vm.$mount()``进行挂载。然后新建一个实例的渲染watcher，并执行下面的``updateComponent``函数：

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```

该函数先调用``vm._render()``生成一个虚拟节点，很明显这是一个App组件节点。所以我们来看看``_createElement()``对组件节点是怎么创建的。它定义在``src/core/vdom/create-element.js``：

```js
if (typeof tag === 'string') {
  let Ctor
  // 获取tag的命名空间
  ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
  if (config.isReservedTag(tag)) {
    // 平台保留的标签
    if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
      warn(
        `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
        context
      )
    }
    vnode = new VNode(
      config.parsePlatformTagName(tag), data, children,
      undefined, undefined, context
    )
  } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // 在vm的options的components选项查找，如果存在则是组件节点
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    // 未知的元素
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }
} else {
  // direct component options / constructor
  vnode = createComponent(tag, data, context, children)
}
```

上面是创建虚拟节点的关键代码。因为tag是一个App组件的配置对象，所以调用``createComponent()``方法生成一个组件虚拟节点。这个方法定义在``src/core/vdom/create-component.js``:

```js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }

  // _base的值为Vue构造函数
  const baseCtor = context.$options._base

  // 组件的配置项是对象，调用Vue.extend生成vue组件类
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // 异步组件
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
    if (Ctor === undefined) {
      // 异步组件一开始用空的注释节点做占位
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  // v-model的处理
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // 从vnode的data中提取props数据
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  // 函数组件处理
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  const listeners = data.on
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // install component management hooks onto the placeholder node
  // 安装组件vnode的各种钩子
  installComponentHooks(data)
  // 返回组件的占位节点
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  // ..

  return vnode
}
```

这个方法一开始先获取``context.$options._base``，也就是Vue构造函数。然后调用``Vue.extend()``返回组件的构造器。它定义在``src/core/global-api/extend.js``：

```js
Vue.extend = function (extendOptions: Object): Function {
  extendOptions = extendOptions || {}
  const Super = this
  const SuperId = Super.cid

  // 缓存组件的构造函数到组件配置对象
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId]
  }

  const name = extendOptions.name || Super.options.name
  if (process.env.NODE_ENV !== 'production' && name) {
    validateComponentName(name)
  }

  const Sub = function VueComponent (options) {
    this._init(options)
  }
  // 继承Vue原型的方法
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++

  // 合并配置，组件构造器也拥有Vue.options全局配置
  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )
  Sub['super'] = Super

  // 把组件props和computed挂载原型上，避免每次实例话组件的时候
  // 都在实例上代理一遍
  if (Sub.options.props) {
    initProps(Sub)
  }
  if (Sub.options.computed) {
    initComputed(Sub)
  }

  // 各种Vue静态方法的继承
  Sub.extend = Super.extend
  Sub.mixin = Super.mixin
  Sub.use = Super.use

  ASSET_TYPES.forEach(function (type) {
    Sub[type] = Super[type]
  })
  // enable recursive self-lookup
  if (name) {
    Sub.options.components[name] = Sub
  }

  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  cachedCtors[SuperId] = Sub
  return Sub
}
```

这个方法一开始先缓存组件构造器到组件配置对象的``extendOptions._Ctor``中，在后面再用到该组件，直接返回组件构造器。然后定义组件构造器：

```js
const Sub = function VueComponent (options) {
  this._init(options)
}
```

所以新建一个组件实际入口也是``vm._init()``方法。然后指定原型为``Vue.prototype``让它拥有Vue原型方法。接下来处理组件的option配置，它调用``mergeOptions()``方法把``Vue.options``上的属性合并到组件构造器的options，比如平时我们全局注册的组件，就是在这步进行合并，让我们组件内直接使用而不用声明。最后，把Vue上面的静态方法也赋值到组件构造器，最后返回这个构造器。

回到``createComponent()``方法，如果创建组件配置不是一个对象，证明是一个异步组件，所以下面就是对异步工厂函数的处理：

```js
let asyncFactory
if (isUndef(Ctor.cid)) {
  asyncFactory = Ctor
  Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
  if (Ctor === undefined) {
    // 异步组件一开始用空的注释节点做占位
    // return a placeholder node for async component, which is rendered
    return createAsyncPlaceholder(
      asyncFactory,
      data,
      context,
      children,
      tag
    )
  }
}
```

里面的实现细节我们之后再分析。接下来是处理``v-model``，``props``等，我们暂且跳过。然后到了下面这个方法：

```js
installComponentHooks(data)  // 安装钩子
```

这个方法主要是安装组件vnode在接下来patch过程需要调用的钩子函数。它的定义：

```js
const componentVNodeHooks = {
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
  },

  prepatch(oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    // ...
  },

  insert (vnode: MountedComponentVNode) {
    // ...
  },

  destroy (vnode: MountedComponentVNode) {
    // ..
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)

// 合并对应阶段的钩子
function mergeHook (f1: any, f2: any): Function {
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}

function installComponentHooks (data: VNodeData) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}
```

显而易见，它把``componentVNodeHooks``对象定义的各种阶段钩子合并到了我们新建的组件vnode的hook属性上面。至此我们组件vnode就创建完成并返回，输出下返回的结果：

<img src="https://blog.inoob.xyz/posts/786ee8b8/1.jpg"/>


## 创建组件实例

现在我们已经得到组件的虚拟DOM，正确的说是组件占位vnode。因为它在渲染后会被组件对应的DOM替换，比如我们例子的``<App/>``组件。

执行完``render``后调用Vue实例的``vm._update()``方法，该方法里面会走下面的方法：

```js
if (!prevVnode) {
  // initial render
  // 首次挂载
  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
}
```

接下来的过程上一篇一样。会进行``patch()``方法并执行oldvnode为真实DOM的条件逻辑，不同的是``createElm()``方法里面会执行到下面代码为``true``并返回，因为我们此时vnode为组件虚拟节点：

```js
// 组件节点的处理
if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
  return
}
```

来看下``createComponent``方法的定义：

```js
// 创建组件包括组件的实例，组件的挂载
function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data;
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
    if (isDef((i = i.hook)) && isDef((i = i.init))) {
      // 调用组件vnode的init钩子
      i(vnode, false /* hydrating */);
    }

    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue);
      // 把组件对应的DOM替换组件占位符
      insert(parentElm, vnode.elm, refElm);
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
      }
      return true;
    }
  }
}
```

这个方法会先调用vnode上面的init钩子函数，init钩子主要是创建组件实例，并且得到组件真实DOM节点。我们看下init钩子的定义。在定义我们前面创建组件vnode的地方：

```js
const componentVNodeHooks = {
  init(vnode: VNodeWithData, hydrating: boolean): ?boolean {
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
  },

  //...
}
```

这个方法``createComponentInstanceForVnode``创建组件的实例。再看这个方法实现之前，现在说下``activeInstance``变量的意义。它是当前Vue或者组件实例，作为一个全局变量，主要维护组件树对应的实例对象的父子关系。在vm._update()方法里面处理：

```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const restoreActiveInstance = setActiveInstance(vm)
  vm._vnode = vnode

  if (!prevVnode) {
    // initial render
    // 首次挂载
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  restoreActiveInstance()

   // ..  
}
```

``setActiveInstance()``方法定义：

```js
export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}
```

很简单，先把之前的实例对象存起来，再设置成最新调用update的实例。在patch完后就恢复原来的实例。

现在来看下``createComponentInstanceForVnode()``方法的定义：

```js
// 创建组件实例
export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any, // activeInstance in lifecycle state
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode, // 组件的占位符vnode
    parent               // 组件的父实例vm
  }
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnode.componentOptions.Ctor(options) // 调用vm._init()方法
}
```

这个方法主要通过``new vnode.componentOptions.Ctor(options)``创建一个组件实例，然后调用``vm._init()``方法回到我们之前创建Vue实例的逻辑，但是有两个不同的地方。一个是合并配置，它会走下面的处理：

```js
if (options && options._isComponent) {
  // 组件实例的配置合并
  initInternalComponent(vm, options)
} else {
  // .. 不走这
}
```

因为组件构造器已经在extend的时候合并了Vue的全局属性，没必要再合并一次。最后组件实例不会走下面方式的挂载:

```js
// 使用new Vue进行挂载，组件的挂载不会走这
if (vm.$options.el) {
  vm.$mount(vm.$options.el);
}
```

组件的挂载定义在init钩子，如下：

```js
child.$mount(hydrating ? vnode.elm : undefined, hydrating)
```

## 创建组件真实的DOM

接下来就走挂载的逻辑，这个和前面Vue实例的挂载一样。最后也是会走到``vm.__patch__()``方法，不同的是``vm.$el``是``undefined``。所以在``patch``函数里面，它会执行下面条件逻辑：

```js
if (isUndef(oldVnode)) {
  // empty mount (likely as component), create new root element
  isInitialPatch = true
  createElm(vnode, insertedVnodeQueue)
} 
```

这个逻辑就是调用``createElm()``方法把App组件对应的DOM虚拟节点转为真实的DOM，并且存储在vnode.elm上。方法我们上一篇分析过，这里不再累赘。这我们例子中也就是下面对应的DOM：

```html
  <div class="app">
    {{ msg }}
  </div>
```

``patch()``返回``vnode.elm``作为``vm.__patch__()``的结果存在``vm.$el``。这里的``vm``就是我们App组件实例。也就是我们我们已经得到App组件的真实DOM，并存在``vm.$el``上面，也就是App组件虚拟节点的``vnode.componentInstance.$el``。

执行完App组件实例的``updateComponents()``函数，流程回到App虚拟节点的``init()``钩子。然后执行下面的代码:

```js
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

通过``initComponent``方法会把组件对应的真实DOM赋值给``vnode.elm``，注意这是vnode是组件App的占位虚拟节点，然后调用``insert()``方法把组件插入DOM中。至此，我们App组件就渲染完成：

<img src="https://blog.inoob.xyz/posts/786ee8b8/2.jpg"/>

## 总结

其实，Vue组件化的渲染过程是一个深度遍历的过程。假如我们例子中的App组件中包含其他组件，也会先创建对应占位vnode。 在App实例调用``update``的时候创建包含组件的实例，创建组件的真实DOM并插入到App组件的DOM中，如此反复递归。最后``new Vue``获取最终的DOM节点插入真实DOM环境。

通过上面的分析，我们可以知道组件DOM插入是先子后父的，并且它满足树的深度优先遍历。