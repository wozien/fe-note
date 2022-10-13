# new Vue()发生啥

当我们通过``new Vue()``的实例挂载后，会替换对应挂载的DOM节点。现在我们通过源码的角度分析其背后的实现主流程。

<!--more-->

## Vue构造函数

我们看一下Vue的一个简单例子：

```html
<div id="app">{{ msg }}</div>

<script>
  new Vue({
    el: '#app',
    data: {
      msg: 'hello vue'
    }
  });
</script>
```

现在我们来看看Vue构造函数的定义。它定义在``src/core/instance/index.js``中：

```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

// 在Vue.prototype上定义各种方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

可见Vue是一个接收option配置对象的构造函数。下面各种mixin方法是在Vue的原型上定义方法。比如``new Vue()``的时候调用的``_init()``就是在initMixin定义的，下面来看看``_init()``方法的实现。

## vm._init()

``vm._init()``方法定义在``src/core/instance/init.js``中，我们删除性能监测相关的代码：

```js
let uid = 0

Vue.prototype._init = function (options?: Object) {
  const vm: Component = this
  vm._uid = uid++

  // ... 性能监测相关

  // vm实例的标记
  vm._isVue = true
 
  if (options && options._isComponent) {
    // 组件实例的配置合并
    initInternalComponent(vm, options)
  } else {
    // 普通Vue实例的配置合并，主要是把全局的一些component,directive,filter合并到vm
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  
  vm._self = vm
  initLifecycle(vm)  // 维护vm.$parent和vm.$children
  initEvents(vm)  
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm)
  initState(vm)  // 状态监听的处理
  initProvide(vm)
  callHook(vm, 'created')

  // 使用new Vue进行挂载，组件的挂载不会走这
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```

这个方法首先处理配置的合并，其中``initInternalComponent()``方法是处理组件实例的配置，我们本文例子走的是``mergeOptions``方法，它主要是把Vue.option上的一些全局的component,directive,filter合并到vm，里面的合并策略代码我们之后再详细分析。

之后，各种初始化实例的不同模块初始化工作，比如``initState()``方法是处理状态相关代码，比如data数据的响应处理等。``callHook()``方法为执行生命周期钩子,可见``initState()``方法是在beforeCreate钩子后面调用的，这就是我们只能在create钩子获取vm状态的原因。

最后，如果是``new Vue()``配置对象中提供了el,我们就调用``vm.$mount()``方法进行挂载。下面我们分析``$mount()``方法的代码。

## vm.$mount()

实例的挂载方法是和平台相关的，并且编译和运行时的入口也是不一样的。编译版本的入口是在运行时的基础上处理配置对象template，把模版字符串转为``render()``方法。所以我们从编译版本的mount入口开始分析，它是定义在``src/platforms/web/entry-runtime-with-compiler.js``中：

```js
// 向缓存runtime版本的mount函数
const mount = Vue.prototype.$mount

Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 返回el的DOM对象
  el = el && query(el)

  // 不能挂载在body或者document
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // 如果options中没有render方法，则根据template或者el获取render
  if (!options.render) {
    let template = options.template
    if (template) {
      // 先处理template成HTML字符串
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 把el的对应dom的outhtml作为template
      template = getOuterHTML(el)
    }
    
    if (template) {

      // 编译模版template，获取render
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  // 调用runtime版本的mount方法
  return mount.call(this, el, hydrating)
}
```

一开始我们先一个变量缓存运行版本的mount函数，然后再定义编译版本的``$mount()``方法。方法首先处理要处理配置对象的template，如果提供了，要处理各种配置方式最后转为html字符串。本文例子没有template，所以获取el的对应DOM的OuterHTML作为template。

再获取到template后会调用``compileToFunctions()``方法把模版编译成render函数。在vue中处理模版是采用虚拟DOM的方式，而执行``render()``方法就可以获得对应模版的虚拟DOM节点。最后，调用运行版本的mount方法。

运行版本的mount方法定义在``src/platforms/web/runtime/index.js``中：

```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

这个方法很简单，先把el转成DOM对象，然后调用``mountComponent()``方法。这个方法定义在``src/core/instance/lifecycle.js``中：

```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el

  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      // ..如果存在template会报错
    }
  }

  // 调用beforeMount钩子函数
  callHook(vm, 'beforeMount')

  let updateComponent
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    // .. 性能监测相关
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // 新建一个渲染watcher，在构造函数中会调用get()方法
  // updateComponent会被执行
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true)
  hydrating = false

  // vm.$vnode表示父vnode，只有根实例才会调用
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

方法一开始会判断render方法时候存在，不在则返回一个创建空节点的方法，并在开发环境检测是否运行版本却用了template配置。接着定义了一个``updateComponent``函数作用新建Watcher实例的参数，先不管Watcher的实现，只要知道在实例化watcher过程中``updateComponent()``方法会被执行。执行后这个方法后，判断vm是否是根实例，是的话调用mounted钩子。

## vm._render()

在``updateComponent()``方法执行后，会先执行``vm._render()``方法返回实例对应的虚拟节点。虚拟节点其实就是用一个普通的JS对象来简单描述DOM节点。``vm._render()``方法定义在``src/core/instance/render.js``中：

```js
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  // 保存父虚拟节点
  vm.$vnode = _parentVnode
 
  let vnode
  try {
    currentRenderingInstance = vm
    // 调用vm上的render函数
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    handleError(e, vm, `render`)
    // ... 错误相关处理
  } finally {
    currentRenderingInstance = null
  }

  // ...
  
  // set parent
  vnode.parent = _parentVnode
  return vnode
}
```

很简单看出，该方法主要是把``vm.$createElement``作为参数调用options上的``render()``方法。``vm.$createElement``的定义为：

```js
vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
```

很显然，这个方法是对``createElement()``方法的一层封装，这个方法是创建一个虚拟节点。这样看来，我们自己在写``render()``函数的时候就能用到这个参数，比如:

```js
new Vue({
  el: '#app',
  data: {
    msg: 'hello vue'
  },
  render(h) {
    return h('div', {}, this.msg)
  }
});
```

这里h参数就是``vm.$createElement``。但是我们例子中并不会用到这个参数，因为我们并没有手写render函数，而是用过vue编译生成的render。这个时候我们调用的是``vm._c``:

```js
vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
```

他们两个之间的区别就是最后一个参数。这个参数的意义我们来看下``createElement()``函数的定义。在``src/core/vdom/create-element.js``中定义：

```js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // 兼容不传data的情况
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    // 对children进行格式化
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

这个方法先处理参数data不是一个属性配置对象的情况。然后调用``_createElement()``方法，这个方法在同个文件定义。这个方法会先对子节点children进行处理，如果是手写的render函数，会把children转为vnode对象数组：

```js
if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
}
```

而为实例是调用vm._c创建的虚拟节点，所以会走``simpleNormalizeChildren()``方法，这个方法是对children进行一次数组打平操作，但是只能打平一层。

然后根据tag判断，调用不同方法返回vnode。我们例子是tag是div，为平台内置标签，所以直接走下面条件：

```js
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
}
```

通过``new VNode()``直接返回一个vnode对象。``createComponent()``方法是创建组件节点vnode的实现，我们在之后再分析。至此。我们``vm._render()``方法就执行完了，我们也成功的获取到了el对应节点的虚拟node，我们看下vnode的结果：

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54bff9a6ddec0~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp"/>

## vm._update()

执行完``vm._render()``方法后返回的虚拟vnode作为参数，调用``vm._update()``方法。它定义在``src/core/instance/lifecycle.js``中：

```js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const restoreActiveInstance = setActiveInstance(vm)
  vm._vnode = vnode
  // Vue.prototype.__patch__ is injected in entry points

  if (!prevVnode) {
    // 首次挂载
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  restoreActiveInstance()

  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }

  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el
  }
}
```

这个方法主要是调用``vm.__patch__()``方法来对比新旧两个虚拟节点，找出状态变化引起的差异从而更新DOM。并返回更新完最新的DOM节点，赋值给``vm.$el``。对于首次挂载会执行：

```js
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
```

其中``vm.__patch__()``的定义:

```js
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

而``patch``方法的定义：

```js
export const patch: Function = createPatchFunction({ nodeOps, modules })
```

``patch()``方法是通过调用``createPatchFunction()``方法返回的，其中nodeOps是对DOM操作方法的封装，modules是创建vnode对比过程需要调用的钩子函数。因为vue是可实现跨平台，跨平台最重要的一点就是对vnode的操作和解析方式不一样，所以通过一个工厂函数返回对应的patch方法。

我们来简单看下``createPatchFunction()``方法，这个方法主要是定义了patch过程需要用到的工具函数，代码比较长，我们先看返回的patch函数结果：

```js
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

export function createPatchFunction(backend) { 
  let i, j
  const cbs = {}
  const { modules, nodeOps } = backend

  // 收集钩子函数
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  // ... patch过程函数的封装

  // 返回patch
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      const isRealElement = isDef(oldVnode.nodeType) // 是否为dom节点，首次挂载为true
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        // 同一个节点进行diff
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        if (isRealElement) {
          // SSR相关
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
          // 创建一个简单的vnode
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        // 用vnode创建dom，并插入
        createElm(
          vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // destroy old node
        if (isDef(parentElm)) {
          // 删除旧的节点
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}
```

因为首次挂载我们的oldVnode为``vm.$el``，是配置中el对应的DOM对象，所以isRealElement变量为``true``。所以会走下面的流程代码：

```js
if (isRealElement) {
  // ...SSR相关
  // 创建一个简单的vnode
  oldVnode = emptyNodeAt(oldVnode);
}

// replacing existing element
const oldElm = oldVnode.elm;
const parentElm = nodeOps.parentNode(oldElm);

// create new node
// 用vnode创建dom，并插入
createElm(
  vnode,
  insertedVnodeQueue,
  oldElm._leaveCb ? null : parentElm,
  nodeOps.nextSibling(oldElm)
);

// destroy old node
if (isDef(parentElm)) {
  // 删除旧的节点
  removeVnodes([oldVnode], 0, 0);
} else if (isDef(oldVnode.tag)) {
  invokeDestroyHook(oldVnode);
}
```

首先通过``emptyNodeAt()``方法把实际的DOM转为虚拟节点，来看下这个方法的定义：

```js
function emptyNodeAt (elm) {
  return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
}
```

这个方法方法把实际的DOM存在``vnode.elm``中，在后续我们通过：

```js
const parentElm = nodeOps.parentNode(oldElm);
```

获取实际DOM的父节点，在我们例子中就是body节点。然后调用``createElm()``创建新的vnode对应的DOM节点，并插入到parentElm，来看下他的定义：

```js
// 用vnode创建dom并插入
function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
  if (isDef(vnode.elm) && isDef(ownerArray)) {
    vnode = ownerArray[index] = cloneVNode(vnode);
  }

  vnode.isRootInsert = !nested;
  // 创建vnode的处理
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return;
  }

  const data = vnode.data;
  const children = vnode.children;
  const tag = vnode.tag;
  if (isDef(tag)) {
    if (process.env.NODE_ENV !== 'production') {
      if (data && data.pre) {
        creatingElmInVPre++;
      }
      if (isUnknownElement(vnode, creatingElmInVPre)) {
        warn(
          'Unknown custom element: <' +
            tag +
            '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
          vnode.context
        );
      }
    }

    // 创建标签节点
    vnode.elm = vnode.ns
      ? nodeOps.createElementNS(vnode.ns, tag)
      : nodeOps.createElement(tag, vnode);
    setScope(vnode);

    if (__WEEX__) {
      // ... weex处理
    } else {
      // 递归创建vnode的children对应的dom节点，并插入到vnode.elm
      createChildren(vnode, children, insertedVnodeQueue);
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
      }
      // 把vnode创建的node插入到真实的dom
      insert(parentElm, vnode.elm, refElm);
    }

    if (process.env.NODE_ENV !== 'production' && data && data.pre) {
      creatingElmInVPre--;
    }
  } else if (isTrue(vnode.isComment)) {
    // 创建注释节点
    vnode.elm = nodeOps.createComment(vnode.text);
    insert(parentElm, vnode.elm, refElm);
  } else {
    // 创建文本节点
    vnode.elm = nodeOps.createTextNode(vnode.text);
    insert(parentElm, vnode.elm, refElm);
  }
}
```

``createComponent()``方法是对组件vnode处理，我们这里返回``false``继续下面逻辑。接下来判断tag是否有值，有的话会先``nodeOps.createElement()``生成一个空DOM节点，然后调用``createChildren()``方法把子节点也生成DOM，并插入到当前的vnode创建的DOM节点：

```js
function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(children)
    }
    for (let i = 0; i < children.length; ++i) {
       // 递归调用
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
  }
}
```

插入完成后调用``invokeCreateHooks()``，执行moudles上和vnode上定义的create钩子。这个过程主要是处理vnode上data定义的各种属性，比如class，event等。它们的实现都是在``src/platforms/web/runtime/modules``。 最后调用``insert()``方法把生成的新DOM插入到父亲节点，例子中是body。来看下``insert()``方法的定义：

```js
function insert (parent, elm, ref) {
  if (isDef(parent)) {
    if (isDef(ref)) {
      if (nodeOps.parentNode(ref) === parent) {
        nodeOps.insertBefore(parent, elm, ref)
      }
    } else {
      nodeOps.appendChild(parent, elm)
    }
  }
}
```

我们来看下nodeOps中两个插入的方法，它们都定义在``src/platforms/web/runtime/node-ops.js``中：

```js
export function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function appendChild (node: Node, child: Node) {
  node.appendChild(child)
}
```

很明显，这都是在原生操作DOM了。于是，执行完查看DOM为

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54bfff4f384c7~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp"/>

插入DOM后，在调用``removeVnodes()``方法删除旧的节点：

```js
// 删除旧的节点
removeVnodes([oldVnode], 0, 0)
```

最后调用``invokeInsertHook()``方法执行插入DOM后的各种钩子函数。至此，我们的``new Vue()``对应的DOM就最成功替换调原来挂载的节点。

## 总结

``new Vue()``进行挂载先调用实例的``_init()``方法进行初始化工作，然后调用``$mount()``方法进行挂载操作。挂载主要新建一个渲染的watcher，然后马上执行watcher的``getter``。也就是执行``updateComponent()``函数，在这个函数中先通过``vm._render()``生成虚拟节点，然后再调用``vm._update()``进行节点的patch过程。patch过程针对了oldVnode为真实的DOM元素进行相关的处理。处理过程大概是用新的vnode生成DOM，然后替换调原来的DOM。

可以用下图概括:

<img src="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/10/16e54bfeea321e0b~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp"/>