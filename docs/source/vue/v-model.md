# 指令v-model

在Vue中我们可以用`v-model`指令来使表单的值和状态进行双向绑定，当表单的值改变时绑定的值也会变化。其实，`v-model`是Vue提供的`props`和事件的语法糖，现在我们通过源码分析下这其中的原理。

## 表单元素绑定

我们先来看一下`v-model`的例子:

```js
import Vue from 'vue';

new Vue({
  el: '#app',
  template: `
    <div>
      <input v-model="message" />
      <p>{{ message }}</p>
    </div>
  `,
  data: {
    message: ''
  }
});
```

### 编译解析

对于`v-model`和其他指令一样，在模版的编译解析阶段会走`src/compiler/parser/index.js`文件的`processAttrs`方法，这个方法是对ast节点的attrsList属性进行处理。因为这个指令不是`v-bind`和`v-on`等特殊指令，所以该方法会走下面逻辑：

```js
name = name.replace(dirRE, '')
// parse arg
const argMatch = name.match(argRE)
let arg = argMatch && argMatch[1]
isDynamic = false
if (arg) {
  name = name.slice(0, -(arg.length + 1))
  if (dynamicArgRE.test(arg)) {
    arg = arg.slice(1, -1)
    isDynamic = true
  }
}
addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i])
if (process.env.NODE_ENV !== 'production' && name === 'model') {
  checkForAliasModel(el, value)
}
```

这个方法就是处理普通指令并调用`addDirective`方法在ast节点的`directives`属性上增加指令对象，对于我们的例子，执行完的结果:

<img src="http://blog.inoob.xyz/posts/a2192891/1.jpg" />

现在对`v-model`的编译解析阶段就完成了，接下来是进行编译代码生成阶段。

### 代码生成

在编译代码生成阶段，会在`src/compiler/codegen/index.js`文件对于data代码生成入口函数`genData`中处理指令代码的相关逻辑，这部分逻辑都在`genDirectives`函数处理:

```js
// 生成render代码入口
export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','
  
  // ...
}
```

来看下`genDirectives`函数的定义:

```js
function genDirectives (el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives
  if (!dirs) return
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    const gen: DirectiveFunction = state.directives[dir.name]
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn)
    }
    if (needRuntime) {
      hasRuntime = true
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}
```

这个方法循环遍历ast节点的`directives`属性的每个指令，对于每个指令会调用`state.directives[dir.name]`返回的函数。这里的state是指Vue编译相关的一些配置，这些配置和平台有关，它的入口在`src/platforms/web/compiler/options.js`：

```js
import directives from './directives/index'
//...

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
```

和指令相关配置定义在`src/platforms/web/compiler/directives/index.js`中：

```js
import model from './model'
import text from './text'
import html from './html'

export default {
  model,
  text,
  html
}
```

很明显Vue对这3个特殊的指令编译都有特殊处理。所以上面的`gen`函数就是指`src/platforms/web/compiler/directives/model.js`文件中定义的`model`方法:

```js
export default function model (
  el: ASTElement,
  dir: ASTDirective,
  _warn: Function
): ?boolean {
  warn = _warn
  const value = dir.value
  const modifiers = dir.modifiers
  const tag = el.tag
  const type = el.attrsMap.type

  if (process.env.NODE_ENV !== 'production') {
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn(
        `<${el.tag} v-model="${value}" type="file">:\n` +
        `File inputs are read only. Use a v-on:change listener instead.`,
        el.rawAttrsMap['v-model']
      )
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers)
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers)
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers)
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers)
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers)
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers)
    // component v-model doesn't need extra runtime
    return false
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `<${el.tag} v-model="${value}">: ` +
      `v-model is not supported on this element type. ` +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    )
  }

  // ensure runtime directive metadata
  return true
}
```

这个方法主要是处理`v-model`绑定在不同表单或者组件的处理。在我们例子是绑定在`input`，所以会调用`genDefaultModel`方法：

```js
function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const type = el.attrsMap.type

  const { lazy, number, trim } = modifiers || {}
  const needCompositionGuard = !lazy && type !== 'range'
  const event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input'

  let valueExpression = '$event.target.value'
  if (trim) {
    valueExpression = `$event.target.value.trim()`
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }

  let code = genAssignmentCode(value, valueExpression)
  if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`
  }

  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code, null, true)
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()')
  }
}
```

这个方法先获取`v-model`指令的修饰符，接下来是根据不同修饰符对事件类型`event`和表达式的值`valueExpression`的处理。然后调用`genAssignmentCode`方法生成我们回调函数的`code`：

```js
export function genAssignmentCode (
  value: string,
  assignment: string
): string {
  const res = parseModel(value)
  if (res.key === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}
```

这个方法主要是要处理指令表达式是类似`test[test1[key]]`, `test["a"][key]`等情况。我们例子直接返回`${value}=${assignment}`。因为我们没设置lazy，所以最终我们的code为`if($event.target.composing)return;message=$event.target.value`。对于composing为真直接返回这段逻辑我们稍后分析。接下来就是`v-model`指令的关键逻辑：

```js
addProp(el, 'value', `(${value})`)
addHandler(el, event, code, null, true)
```

它会往ast节点上增加一个`props`和绑定一个事件event，这就是Vue语法糖实现的核心。执行完这段逻辑看下ast节点结果:

<img src="http://blog.inoob.xyz/posts/a2192891/2.jpg" />

执行完平台的model方法后返回`true`，再回到`genDirectives`方法，如果`needRuntime`为`true`，就把指令相关属性就行字符串代码拼接并最终返回。这里我们看下`genData`函数有一细节，就是函数最开始就处理指令，这是因为处理指令时候可能会在节点上新增其他一些属性，例如我们`v-model`指令会增加`props`和事件。

最后，来看下`render`生成的代码结果:

```js
with (this) {
  return _c('div', [
    _c('input', {
      directives: [{ name: 'model', rawName: 'v-model', value: message, expression: 'message' }],
      domProps: { value: message },
      on: {
        input: function($event) {
          if ($event.target.composing) return;
          message = $event.target.value;
        }
      }
    }),
    _v(' '),
    _c('p', [_v(_s(message))])
  ]);
}
```

## 指令钩子

在上面分析后，我们的例子其实等价于:

```js
new Vue({
  el: '#app',
  template: `
    <div>
      <input :value="message" @input="message=$event.target.value"/>
      <p>{{ message }}</p>
    </div>
  `,
  data: {
    message: ''
  }
});
```

但是这里面有一个细微的差别我们可能没注意，那就是对于中文输入的处理。使用`v-model`输入中文过程中我们状态message是不会更着变化的，而等价的写法就会，那这中间的处理Vue是怎么实现的呢？

我们知道Vue的自定义指令存在钩子函数，并且在绑定的元素的插入或者更新阶段触发。其实，Vue也内置了`v-model`的钩子函数来处理我们上面说的中文输入的场景。现在来看下它的定义。

在我们虚拟节点的`patch`过程中会触发一系列的钩子函数，对于指令会在`create`,`update`和`destory`钩子都会有处理，它的入口定义在`src/core/vdom/modules/directives.js`：

```js
export default {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode: VNodeWithData) {
    updateDirectives(vnode, emptyNode)
  }
}

function updateDirectives (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}
```

很明显，在上面的三个时期都会调用`_update`函数：

```js
function _update (oldVnode, vnode) {
  const isCreate = oldVnode === emptyNode
  const isDestroy = vnode === emptyNode
  const oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context)
  const newDirs = normalizeDirectives(vnode.data.directives, vnode.context)

  const dirsWithInsert = []
  const dirsWithPostpatch = []

  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    if (!oldDir) {
      // new directive, bind
      callHook(dir, 'bind', vnode, oldVnode)
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value
      dir.oldArg = oldDir.arg
      callHook(dir, 'update', vnode, oldVnode)
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir)
      }
    }
  }

  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode)
      }
    })
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy)
      }
    }
  }
}
```

这个方法用`isCreate`表示当前vnode是否是新建的节点，`isDestroy`表示当前节点是否销毁。`normalizeDirectives`方法是获取格式化指令对象，把指令的钩子函数进行整合到`def`。接着循环新节点的指令数组`newDirs`，对于每个指令对象`dir`在老的指令对象`oldDirs`不存在，这会调用指令的`bind`钩子，如果有定义`insert`钩子，则push到`dirsWithInsert`队列中，这样能保证所有的指令执行完`bind`钩子才去执行`insert`钩子。

如果老的指令对象`oldDir`存在，则调用指令的`update`钩子，并把`componentUpdated`钩子存到`dirsWithPostpatch`中，这样能保证所有的指令执行完`update`钩子才去执行`componentUpdated`钩子。最后把执行指令`insert`钩子数组函数合并到虚拟节点的自身的`insert`钩子，把执行指令`componentUpdated`钩子数组函数合并到虚拟节点的自身的`postpatch`钩子，这样就会更新虚拟节点在`patch`过程的对应阶段执行。

如果不是新建的节点，并且老的指令数组`oldDirs`如果有`newDirs`中不存在的，则证明该指令已经废弃，会调用响应的`unbind`钩子函数。

回到我们上面的问题，看看`v-model`内置的`insert`钩子的实现，它定义在`src/platforms/web/runtime/directives/model.js`中：

```js
const directive = {
  inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', () => {
          directive.componentUpdated(el, binding, vnode)
        })
      } else {
        setSelected(el, binding, vnode.context)
      }
      el._vOptions = [].map.call(el.options, getValue)
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart)
        el.addEventListener('compositionend', onCompositionEnd)
        el.addEventListener('change', onCompositionEnd)
        if (isIE9) {
          el.vmodel = true
        }
      }
    }
  }
}
```

上面代码在处理绑定`input`和`textarea`类型的绑定时，在元素插入DOM后会另外绑定`compositionstart`和`compositionend`事件，它们分别会在中文输入过程和输入完成触发。来看下对应的回调函数:

```js
function onCompositionStart (e) {
  e.target.composing = true
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) return
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger (el, type) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}
```

在中文输入过程中，设置`e.target.composing`为`true`，这个时候我们再来看下`v-model`绑定事件的函数体：

```js
if ($event.target.composing) return;
message = $event.target.value;
```

当中文输入过程中触发的`input`事件，`$event.target.composing`为`true`直接返回，这样状态就会不更着改变了。当中文输入完成执行`onCompositionEnd`函数会把`e.target.composing`设置为`false`，这个时候执行函数体就会修改状态message了。

## 组件绑定

`v-model`也可以用到组件上，先看一个例子：

```js
const Child = {
  template: `<div>
    <input :value="value" @input="handleInput">
  </div>`,
  props: ['value'],
  methods: {
    handleInput(e) {
      this.$emit('input', e.target.value);
    }
  }
};

new Vue({
  el: '#app',
  template: `
    <div>
      <Child v-model="message"></Child>
      <p>{{ message }}</p>
    </div>
  `,
  data: {
    message: ''
  },
  components: { Child }
});
```

在组件上使用`v-model`也会在编译模版时进行处理，不同的是在`gen`函数中会走下面的逻辑:

```js
else if (!config.isReservedTag(tag)) {
  genComponentModel(el, value, modifiers)
  // component v-model doesn't need extra runtime
  return false
}
```

因为组件不是平台保留的标签，调用`genComponentModel`方法进行处理并且返回`false`：

```js
export function genComponentModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const { number, trim } = modifiers || {}

  const baseValueExpression = '$$v'
  let valueExpression = baseValueExpression
  if (trim) {
    valueExpression =
      `(typeof ${baseValueExpression} === 'string'` +
      `? ${baseValueExpression}.trim()` +
      `: ${baseValueExpression})`
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }
  const assignment = genAssignmentCode(value, valueExpression)

  el.model = {
    value: `(${value})`,
    expression: JSON.stringify(value),
    callback: `function (${baseValueExpression}) {${assignment}}`
  }
}
```

这个方法主要在ast节点上添加`model`属性来表示指令相关数据，我们例子中执行完的结果为：

<img src="http://blog.inoob.xyz/posts/a2192891/4.jpg" />
  
然后返回`genData`函数，这里返回的dirs为`undefined`，因为组件使用`v-model`单纯是个语法糖，不需要在运行时进行相关处理。另外，这个函数要把节点上的`model`赋值给`data`属性：

```js
// component v-model
if (el.model) {
  data += `model:{value:${
    el.model.value
  },callback:${
    el.model.callback
  },expression:${
    el.model.expression
  }},`
}
```

最后我们看下生成的`render`代码：

```js
with (this) {
  return _c(
    'div',
    [
      _c('Child', {
        model: {
          value: message,
          callback: function($$v) {
            message = $$v;
          },
          expression: 'message'
        }
      }),
      _v(' '),
      _c('p', [_v(_s(message))])
    ],
    1
  );
}
```

很明显，在`Child`的`data`增加了`model`属性，并且会在创建组件构造器时进行处理。在`src/core/vdom/create-component.js`文件的`createComponent`函数有下面一段逻辑:

```js
// v-model的处理
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }
```

来看下`transformModel`的定义：

```js
function transformModel (options, data: any) {
  const prop = (options.model && options.model.prop) || 'value'
  const event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value
  const on = data.on || (data.on = {})
  const existing = on[event]
  const callback = data.model.callback
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing)
    }
  } else {
    on[event] = callback
  }
}
```

这个方法向组件虚拟节点`data`属性增加一个key为`prop`的属性，并且在`on`增加事件`event`，这样就实现了`v-model`的功能。

## 总结

那么至此，`v-model`的实现就分析完了，我们了解到它是 Vue 双向绑定的真正实现，但本质上就是一种语法糖，它即可以支持原生表单元素，也可以支持自定义组件。在组件的实现中，我们是可以配置子组件接收`prop`名称，以及派发的事件名称。