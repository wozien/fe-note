# 插槽 slot

Vue允许我们为组件自定义子模版，这部分内容会替换组件模版中`slot`标签，这就是插槽。那么子组件在渲染过程中是怎么获取到父组件对应的插槽模版的，现在就通过源码来分析。

## 普通插槽

来看一个普通插槽的例子:

```js
import Vue from 'vue';

const Child = {
  template:
    '<div class="container">' +
    '<header><slot name="header"></slot></header>' +
    '<main><slot>默认内容</slot></main>' +
    '<footer><slot name="footer"></slot></footer>' +
    '</div>'
};

new Vue({
  el: '#app',
  template:
    '<div>' +
    '<Child>' +
    '<h1 slot="header">{{title}}</h1>' +
    '<p>{{msg}}</p>' +
    '<p slot="footer">{{desc}}</p>' +
    '</Child>' +
    '</div>',
  data() {
    return {
      title: '我是标题',
      msg: '我是内容',
      desc: '其它信息'
    };
  },
  components: { Child }
});
```

在看源码前，带着几个疑问：

- 在编译阶段是怎么解析父组件的`slot`属性和子组件的`slot`标签
- 创建`slot`虚拟节点的代码是怎么样的
- 在运行时，子组件生成`slot`的虚拟节点是怎么获取到父组件对应的插槽模版

### 父组件渲染函数

在父组件的编译解析阶段，会在`src/compiler/parser/index.js`的`processSlotContent`方法解析带`slot`属性的标签。对于我们例子会命中该方法的下面逻辑:

```js
// slot="xxx"
const slotTarget = getBindingAttr(el, 'slot')
if (slotTarget) {
  el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
  el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot'])
  // preserve slot as an attribute for native shadow DOM compat
  // only for non-scoped slots.
  if (el.tag !== 'template' && !el.slotScope) {
    addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
  }
}
```

这个方法获取属性`slot`对应的值`slotTarget`，然后在对应ast的节点上增加`slotTarget`属性，并在`attrs`属性集合上增加对象`{name: 'slot', value: slotTarget}`。

在代码生成的`genData`会对`slotTarget`属性的ast节点进行处理：

```js
// only for non-scoped slots
if (el.slotTarget && !el.slotScope) {
  data += `slot:${el.slotTarget},`
}
```

这个逻辑是在渲染函数代码的`data`加上`slot`属性，值就是我们该解析标签获取的`slotTarget`。所以我们例子的父组件的渲染函数代码为：

```js
with (this) {
  return _c(
    'div',
    [
      _c('Child', [
        _c('h1', { attrs: { slot: 'header' }, slot: 'header' }, [_v(_s(title))]),
        _c('p', [_v(_s(msg))]),
        _c('p', { attrs: { slot: 'footer' }, slot: 'footer' }, [_v(_s(desc))])
      ])
    ],
    1
  );
}
```

### 子组件渲染函数

子组件的解析阶段要对`slot`标签进行处理。在解析入口文件的`processSlotOutlet`方法中处理，它只是在对应的ast的节点加上`slotName`属性，值为我们设置的插槽name：

```js
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
  }
}
```

在代码生成阶段，如果遇到ast节点的tag是`slot`的话，会调用`genSlot`函数进行统一处理：

```js
// src/compiler/codegen/index.js

export function genElement (el: ASTElement, state: CodegenState): string {

// ...

else if (el.tag === 'slot') {
  return genSlot(el, state)
}
  
  // ...
}

function genSlot (el: ASTElement, state: CodegenState): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,${children}` : ''}`
  const attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(attr => ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      })))
    : null
  const bind = el.attrsMap['v-bind']
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }
  return res + ')'
}
```

这个函数对于我们例子只会执行下面的关键逻辑：

```js
const slotName = el.slotName || '"default"'
const children = genChildren(el, state)
let res = `_t(${slotName}${children ? `,${children}` : ''}`
```

其他部分是获取`slot`标签的属性，这个是作用域插槽的处理，我们稍后再分析。`children`是插槽的默认内容的渲染代码，所以我们的`slot`标签的生成代码是使用`_t`函数包裹。最终，我们来看下子组件的渲染函数代码：

```js
with (this) {
  return _c('div', { staticClass: 'container' }, [
    _c('header', [_t('header')], 2),
    _c('main', [_t('default', [_v('默认内容')])], 2),
    _c('footer', [_t('footer')], 2)
  ]);
}
```

### 运行时阶段

父组件执行`render`函数和正常一样，在创建组件占位虚拟节点时，组件包裹的每个插槽vnode也会被创建。另外会把`children`作为占位节点的组件属性：

```js
const vnode = new VNode(
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context,
  { Ctor, propsData, listeners, tag, children },
  asyncFactory
)
```

在子组件实例初始化合并配置中，会把组件的占位节点的`children`属性给实例配置的`_renderChildren`属性：

```js
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {

// ...
 const parentVnode = options._parentVnode
const vnodeComponentOptions = parentVnode.componentOptions
opts._renderChildren = vnodeComponentOptions.children
}
```

然后执行`initRender`方法进行渲染的初始化工作，这个方法中会调用`resolveSlots`方法获取组件实例的`vm.$slots`的值：

```js
vm.$slots = resolveSlots(options._renderChildren, renderContext)
```

`resolveSlots`方法定义在`src/core/instance/render-helpers/resolve-slots.js`中：

```js
// 获取组件实例的vm.$slots
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  if (!children || !children.length) {
    return {}
  }
  const slots = {}
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else {
      (slots.default || (slots.default = [])).push(child)
    }
  }
  // ignore slots that contains only whitespace
  // 删除空白的slot节点
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  return slots
}
```

这个方法`children`是值组件标签包含的虚拟节点，也就是组件实例的`_renderChildren`属性值。这个方法循环`children`子节点，获取节点`data`属性的`slot`值作为返回结果对象的key，对应的值就是该子节点。所以这个方法就是构造`slot`名到虚拟节点映射对象，对于我们例子的结果是：

<img src="http://blog.inoob.xyz/posts/2ad031ec/1.jpg"/>

接着子组件挂载并执行自身的`render`函数，对应`slot`节点在编译阶段知道它会用`_t`函数创建。这个函数是Vue虚拟节点的渲染辅助函数之一，它们的定义入口在`src/core/instance/render-helpers/index.js`:

```js
export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}
```

所以`_t`对应的就是`renderSlot`函数，在定义在`src/core/instance/render-helpers/render-slot.js`:

```js
export function renderSlot (
  name: string,
  fallback: ?Array<VNode>,
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes
  if (scopedSlotFn) { // scoped slot
    // ...
  } else {
    nodes = this.$slots[name] || fallback
  }

  const target = props && props.slot
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}
```

对应作用域插槽逻辑不看，它其实是通过`this.$slots[name]`那到对应`slot`名的虚拟节点，因为`vm.$slots`在初始化阶段已经处理。如果拿不到就取`fallback`，它是插槽节点的默认内容节点。最终，我们子组件就可以拿到对应的父组件插槽模版进行渲染，注意的是，插槽模版的虚拟节点是在父组件渲染完成的，所以模版的状态只能来自父组件实例，这也是和作用域插槽不同的一点。

## 作用域插槽

同样，先来看一下例子：

```js
import Vue from 'vue';

const Child = {
  template: `
    <div class="child">
      <slot text="Hello " :msg="msg"></slot>
    </div>`,
  data() {
    return {
      msg: 'Vue'
    };
  }
};

new Vue({
  el: '#app',
  template: `
    <div>
      <Child>
        <template slot-scope="props">
          <p>Hello from parent</p>
          <p>{{props.text + props.msg}}</p>
        </template>
      </Child>
    </div>
  `,
  components: { Child }
});
```

### 父组件渲染函数

在编译解析阶段处理`slot`属性的`processSlotContent`函数命中下面的逻辑：

```js
let slotScope
if (el.tag === 'template') {
  slotScope = getAndRemoveAttr(el, 'scope')
  el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
} else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
  el.slotScope = slotScope
}
```

它会在对应的ast节点增加`slotScope`属性，值为设置的子组件提供的插槽数据，在我们例子就是`props`。然后在构造ast树的时候，对于有`slotScope`属性的节点，会执行下面的逻辑：

```js
if (element.slotScope) {
  const name = element.slotTarget || '"default"'
  ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
}
```

`currentParent`表示当前ast节点的父节点。这段代码是在作用域插槽节点的父节点上增加一个`scopedSlots`对象，这个对象是以插槽名为key，插槽ast节点为值的映射对象。在我们例子中，会把`template`的ast节点添加到Child节点的`scopedSlots`对象上：

<img src="http://blog.inoob.xyz/posts/2ad031ec/2.jpg"/>

在代码生成阶段会对拥有`scopedSlots`属性的节点进行处理：

```js
// scoped slots
if (el.scopedSlots) {
  data += `${genScopedSlots(el, el.scopedSlots, state)},`
}
```

`genScopedSlots`方法就是对作用域插槽ast节点对象的处理：

```js
function genScopedSlots(
  el: ASTElement,
  slots: { [key: string]: ASTElement },
  state: CodegenState
): string { 

  const generatedSlots = Object.keys(slots)
    .map(key => genScopedSlot(slots[key], state))
    .join(',')

  return `scopedSlots:_u([${generatedSlots}])`
}
```

这个方法对每个具名插槽节点作为参数调用`genScopedSlot`方法生成代码，并且最后包含在数组里面作为`_u`的参数。来看下`genScopedSlot`的定义：

```js
unction genScopedSlot (
  el: ASTElement,
  state: CodegenState
): string {

  const slotScope = el.slotScope === emptySlotScopeToken
    ? ``
    : String(el.slotScope)
  const fn = `function(${slotScope}){` +
    `return ${el.tag === 'template'
      ? el.if && isLegacySyntax
        ? `(${el.if})?${genChildren(el, state) || 'undefined'}:undefined`
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)
    }}`

  return `{key:${el.slotTarget || `"default"`},fn:${fn}}`
}
```

这个方法主要是返回一个对象的代码。该对象的key具名插槽的名称，fn为构造的函数代码，它的参数为我们自定义的获取子组件的数据对象，函数体插槽节点的渲染代码。对于我们例子，最后得到的渲染代码为：

```js
with (this) {
  return _c(
    'div',
    [
      _c('Child', {
        scopedSlots: _u([
          {
            key: 'default',
            fn: function(props) {
              return [
                _c('p', [_v('Hello from parent')]),
                _v(' '),
                _c('p', [_v(_s(props.text + props.msg))])
              ];
            }
          }
        ])
      })
    ],
    1
  );
}
```

可以看出来这个和普通插槽的区别就是组件Child没有了`children`，而是在`data`增加了`scopedSlots`属性。它是每个具名插槽对应的模版获取函数，这个在运行时会用到。

### 子组件渲染函数

对于作用域插槽子组件的生成代码和普通插槽不同的是它会去处理`slot`标签上的属性，它们合并成一个对象作为`_t`函数的第三个参数。最终我们子组件的渲染代码为：

```js
with (this) {
  return _c(
    'div',
    { staticClass: 'child' },
    [_t('default', null, { text: 'Hello ', msg: msg })],
    2
  );
}
```

### 运行时阶段

对于父组件在执行`render`函数时，在创建Child虚拟节点时候会调用`_u`函数去创建`scopedSlots`属性的值。该函数定义在`src/core/instance/render-helpers/resolve-scoped-slots.js`的`resolveScopedSlots`方法：

```js
export function resolveScopedSlots (
  fns: ScopedSlotsData, 
  res?: Object,
  hasDynamicKeys?: boolean,
  contentHashKey?: number
): { [key: string]: Function, $stable: boolean } {
  res = res || { $stable: !hasDynamicKeys }
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i]
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys)
    } else if (slot) {
      if (slot.proxy) {
        slot.fn.proxy = true
      }
      res[slot.key] = slot.fn
    }
  }
  if (contentHashKey) {
    (res: any).$key = contentHashKey
  }
  return res
}
```

这个函数把传入的插槽获取函数数据转换成一个映射对象。对象的key为插槽的名称，值为插槽模版获取函数。所以，我们例子的Child组件vnode的`scopedSlots`属性最终为：

```js
{ 
  "default": function(props) {
    return [
      _c('p', [_v('Hello from parent')]),
      _v(' '),
      _c('p', [_v(_s(props.text + props.msg))])
    ];
  }
}
```

在我们子组件执行`render`函数之前有下面一点逻辑：

```js
// 作用域插槽处理
if (_parentVnode) {
  vm.$scopedSlots = normalizeScopedSlots(
    _parentVnode.data.scopedSlots,
    vm.$slots,
    vm.$scopedSlots
  )
}
```

这段主要就是把Child组件占位符虚拟节点的`scopedSlots`最终会赋值到组件实例的`$scopedSlots`属性上。然后在创建`slot`虚拟节点的时候执行`renderSlot`函数会走下面逻辑：

```js
const scopedSlotFn = this.$scopedSlots[name]
let nodes
if (scopedSlotFn) { // scoped slot
  props = props || {}
  nodes = scopedSlotFn(props) || fallback
} 
```

其中props是`_t`函数的第三个参数，也就是我们例子的`{ text: 'Hello ', msg: msg }`。因为创建`slot`节点是在子组件环境，所以对应的msg也能取到正确的值。然后作为参数传给我们插槽模版获取函数`scopedSlotFn`，最终创建正确的插槽模版vnode。

到现在，我们就在子组件中正确渲染我们插入的作用域模版了。你会发现，父组件提供的插槽模版的vnode最终是在子组件执行创建的，也是因为我们模版中用到了子组件的状态，这是和普通插槽原理的最大区别。

## 总结

到现在，我们就知道了Vue两种插槽的实现原理。它们两个之间不同的是，普通插槽是在父组件编译和渲染生成好插槽模版vnode，在子组件渲染是直接获取父组件生成好的vnode。作用域插槽在父组件不会生成插槽模版vnode，而是在组件占位vnode上用`scopedSlots`保存这不同具名插槽的获取模版函数，然后在子组件渲染的时候把prop对象作为参数调用该函数获取正确的插槽模版vnode。

总之，插槽的实现就是要在子组件生成`slot`的虚拟节点是能够找到正确的模版和数据作用域。