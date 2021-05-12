# 事件Event

Vue允许我们在模版上用`v-on`或`@`为元素添加DOM事件，并且可以为组件元素添加自定义的事件。现在通过源码角度看看Vue是怎么处理事件的绑定和执行的。

## 模版的事件编译

先通过一个例子看看事件的基本用法：

```js
import Vue from 'vue';

const Child = {
  template: '<button @click="handleClick">click</button>',
  methods: {
    handleClick() {
      console.log('child click');
      this.$emit('select');
    }
  }
};

new Vue({
  el: '#app',
  template: `
    <div>
      <Child @select="handleSelect" @click.native="handleClick"></Child>
    </div>
  `,
  methods: {
    handleClick() {
      console.log('parent click');
    },
    handleSelect() {
      console.log('parent select');
    }
  },
  components: { Child }
});
```

上面例子利用模版的形式给对应的元素和组件绑定事件。首先，Vue会编译模版，会把元素的事件和组件的自定义事件都放在`on`对象上，把组件的原生事件放在`nativeOn`对象上。所以，上面的例子编译后的`render`函数大概如下：

```js
// child 的render
with (this) {
  return _c('button', { on: { click: handleClick } }, [_v('click')]);
}

// Vue 实例的render
with (this) {
  return _c(
    'div',
    [
      _c('Child', {
        on: { select: handleSelect },
        nativeOn: {
          click: function($event) {
            return handleClick($event);
          }
        }
      })
    ],
    1
  );
}
```

`_c`方法是Vue实例的内置方法，它用来创建一个虚拟节点，和`createElement`方法基本一样。

## DOM事件

我们是通过把组件生成的虚拟节点进行`patch`后更新DOM的，所以对于DOM事件的绑定就在该过程处理的。在`patch`的过程中会调用`createElm`生成vnode的真实DOM，在该方法有一段代码：

```js
// 递归创建vnode的children对应的dom节点，并插入到vnode.elm
createChildren(vnode, children, insertedVnodeQueue);
if (isDef(data)) {
  // 处理data属性
  invokeCreateHooks(vnode, insertedVnodeQueue);
}
// 把vnode创建的node插入到真实的dom
insert(parentElm, vnode.elm, refElm);
```

在处理完子节点的创建后，会调用`invokeCreateHooks`方法触发自身和模块的`create`钩子：

```js
function invokeCreateHooks (vnode, insertedVnodeQueue) {
  for (let i = 0; i < cbs.create.length; ++i) {
    cbs.create[i](emptyNode, vnode)
  }
  i = vnode.data.hook // Reuse variable
  if (isDef(i)) {
    if (isDef(i.create)) i.create(emptyNode, vnode)
    if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
  }
}
```

在两个节点进行`patch`过程会调用一系列的钩子函数，比如在生成DOM的时候我们要处理样式，属性，事件等这些都是在模块的`create`钩子进行的，我们来看下模块对应事件钩子的处理，它定义在`src/platforms/web/runtime/modules/events.js`:

```js
export default {
  create: updateDOMListeners,
  update: updateDOMListeners
}
```

在`create`和`update`阶段都会调用`updateDOMListeners`方法：

```js
function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.elm
  normalizeEvents(on)
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  target = undefined
}
```

这个方法先拿出新旧节点的事件对象`on`和`oldOn`，把操作对象`target`设置成`vnode.elm`也就是当前vnode对应的真实DOM，`add`和`remove`是对元素的事件绑定和移除：

```js
function add(name: string, handler: Function, capture: boolean, passive: boolean) {
  target.addEventListener(name, handler, supportsPassive ? { capture, passive } : capture);
}

function remove(name: string, handler: Function, capture: boolean, _target?: HTMLElement) {
  (_target || target).removeEventListener(name, handler._wrapper || handler, capture);
}
```

最后调用`updateListeners`方法进行事件的绑定，这个方法定义在`src/core/vdom/helpers/update-listeners.js`:

```js
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, def, cur, old, event
  // 新增的事件
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    /* istanbul ignore if */
    if (__WEEX__ && isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      // 这里只要修改回调函数的引用即可，不用操作DOM
      old.fns = cur
      on[name] = old
    }
  }
  // 卸载的事件
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
```

这个方法先循环`on`中的每一个方法，如果这个方法不存在`oldOn`表示是一个新增的方法，然后用`createFnInvoker`方法创建对应事件的回调函数，参数是我们用户绑定的回调函数：

```js
export function createFnInvoker (fns: Function | Array<Function>, vm: ?Component): Function {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns
  return invoker
}
```

因为我们可以为事件绑定多个函数回调的，所以要考虑`cur`是一个回调函数数组的情况。`createFnInvoker`方法其实是对我们定义的回调的一个封装，并把这些回调存在返回结果的`fns`属性上。所以在Vue中事件触发的回调其实是执行`invoker`方法，在方法内部通过`fns`获取我们定义的方法并执行。

那Vue为什么直接绑定我们用户定义的回调呢？原因在下面一段处理：

```js
else if (cur !== old) {
  // 这里只要修改回调函数的引用即可，不用操作DOM
  old.fns = cur
  on[name] = old
}
```

当我们是更新状态从而触发事件的更新的话，直接修改`invoker`方法的`fns`指定的回调即可，免去操作真实的DOM去绑定或者移除事件监听。接着再循环`oldOn`的每个事件，如果不存在`on`中就代表移除这个事件的监听。

## 自定义事件

在组件上可以绑定原生和自定义的事件，对于原生的事件对象`nativeOn`会在组件构造阶段赋值给`on`，然后在`create`的钩子函数中和DOM事件的处理逻辑是一样的。在`createComponent`函数中，有这样一段逻辑:

```js
const listeners = data.on
data.on = data.nativeOn

//...

// 返回组件的虚拟节点
const vnode = new VNode(
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context,
  { Ctor, propsData, listeners, tag, children },
  asyncFactory
)
```

它会把自定义事件对象赋值给`listeners`作为虚拟节点的`componentOptions`属性。我们都知道在`patch`过程中会调用组件虚拟节点的`init`钩子并创建组件的实例。然后在实例创建入口`vm._init()`方对组件实例的配置进行处理:

```js
// 处理组件实例的配置
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // 把组件构造函数的options合并到组件实例
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
```

很明显，Vue会把组件绑定的自定义事件对象赋值给配置对象的`_parentListeners`属性上。在接下来的事件初始化方法`initEvents`方法中，处理组件实例的事件：

```js
// 在父组件模版中v-on绑定的事件注册到子组件的事件系统中
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

这个方法先创建`vm._events`空对象来管理实例的事件，然后把用户绑定的自定义事件对象作为`updateComponentListeners`方法参数并调用：

```js
export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  target = undefined
}
```

该方法其实和DOM事件的处理逻辑一样都会`updateListeners`方法进行事件的绑定，不同的是`add`，`remove`和`createOnceHandler`方法的定义：

```js
function add (event, fn) {
  target.$on(event, fn)
}

function remove (event, fn) {
  target.$off(event, fn)
}

function createOnceHandler (event, fn) {
  const _target = target
  return function onceHandler () {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}
```

对于事件的绑定是调用`vm.$on`方法，事件的移除是调用`vm.$off`方法，这两个方式都是Vue提供给用户操作实例事件系统的，它在Vue入口的`eventsMixin`注入到原型对象上：

```js
 Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
  const vm: Component = this
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$on(event[i], fn)
    }
  } else {
    (vm._events[event] || (vm._events[event] = [])).push(fn)
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    if (hookRE.test(event)) {
      vm._hasHookEvent = true
    }
  }
  return vm
}

Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
  const vm: Component = this
  // all
  if (!arguments.length) {
    vm._events = Object.create(null)
    return vm
  }
  // array of events
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$off(event[i], fn)
    }
    return vm
  }
  // specific event
  const cbs = vm._events[event]
  if (!cbs) {
    return vm
  }
  if (!fn) {
    vm._events[event] = null
    return vm
  }
  // specific handler
  let cb
  let i = cbs.length
  while (i--) {
    cb = cbs[i]
    if (cb === fn || cb.fn === fn) {
      cbs.splice(i, 1)
      break
    }
  }
  return vm
}

```

对于`$on`方法，如果事件`event`参数是一个数组，则递归调用`$on`方法对每个方法进行绑定。否则执行：

```js
(vm._events[event] || (vm._events[event] = [])).push(fn)
```

把事件对应的回调函数push到事件队列。对于`$off`方法移除事件，要考虑的是没传参数，`event`是数组和有传回调函数的特殊情况。在移除对应的回调的时候，注意循环是从后面开始的，这样就不会造成`splice`截取后下标的问题。

另外，我们可以通过`vm.$emit`方法触发实例对应事件的回调函数，来看下它的定义:

```js
Vue.prototype.$emit = function (event: string): Component {
  const vm: Component = this
  let cbs = vm._events[event]
  if (cbs) {
    cbs = cbs.length > 1 ? toArray(cbs) : cbs
    const args = toArray(arguments, 1)
    const info = `event handler for "${event}"`
    for (let i = 0, l = cbs.length; i < l; i++) {
      invokeWithErrorHandling(cbs[i], vm, args, vm, info)
    }
  }
  return vm
}
```

这个方法很简单，首先在`vm._events`上根据事件名获取对应的回调队列，然后循环队列，把传给`$emit`方法的剩余参数作为回调的参数进行调用。

## 总结

到现在，我们就了解Vue是如果处理事件系统的。对于DOM原生事件，会在`patch`过程的首次加载的`create`钩子和节点对比的`update`钩子进行处理。对于组件的自定义事件，会在创建实例的事件初始化`initEvents`方法进行处理。它们之间的区别就是`add`和`remove`方法对事件的绑定和移除不同，前者是操作原生的事件系统，后者是操作Vue实例的事件管理对象`_events`。

值得注意的是，我们平时开始利用自定义事件来进行父子组件的通行。会给我们一种错觉就是自定义事件的回调是存在父组件的实例中，其实通过源码分析知道回调函数是注入到子组件的事件系统，在子组件中通过`$emit`方法调用，只是回调函数定义在父组件，所以可以操作父组件的状态，从而达到父子组件的通行。