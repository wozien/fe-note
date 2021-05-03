# VirtualDOM的简单实现

虚拟DOM(``Virtual DOM``)是Vue和React框架实现数据动态更新视图的关键技术，它利用JS运算速度优与DOM从而大大提高的视图渲染性能。由于虚拟DOM是用一个普通对象来表示视图节点结果，所以可以利用这个对象来渲染到不同平台，生成对应的原生控件来实现跨平台。

## 预期效果

我们先来看下面一个例子：

```js
var container = document.getElementById('app');

var vnode = h('div', { key: 'app' }, [h('h1', {}, 'I am old vnode')]);
var newVnode = h('div', { key: 'app' }, [
  h('span', {}, 'after two second'),
  h('h1', {}, 'I am new vnode')
]);

// 首次挂载
patch(container, vnode);

setTimeout(() => {
  patch(vnode, newVnode);
}, 2000);
```

我们创建一个虚拟节点vnode挂载到一个``<div id="app"></div>`` 上，两秒后和新的虚拟节点newVnode比对，更新视图。其中``h()``函数是创建虚拟节点，``patch()``函数是对比两个虚拟节点，实现更新DOM。

## 创建虚拟节点

因为虚拟节点就是一个JS对象，所以我们可以定义一个VNode类来表示节点。因为考虑到参数处理，可以定义一个创建节点函数，在函数内对参数进行处理并用``new VNode()``返回一个虚拟节点:

```js
// VNode类
function VNode(tag, data, ch, text, elm) {
  this.tag = tag || '';
  this.data = data || {};
  this.children = ch;
  this.text = text;
  this.key = data.key || '';
  this.elm = elm || null;
}

// 创建vnode函数
function h(tag, data, ch) {
  var text, children;
  if (ch) {
    // 考虑子节点是文本
    if (typeof ch === 'string') {
      text = ch;
    } else {
      children = ch;
    }
  }

  if (children && children.length) {
    for (var i = 0; i < children.length - 1; i++) {
      if (typeof children[i] === 'string') {
        // 把子节点全部转为vnode
        children[i] = new VNode(undefined, undefined, undefined, children[i]);
      }
    }
  }

  return new VNode(tag, data, children, text);
}
```

## 辅助函数

因为我们需要对DOM进行操作，预先定义一些操作函数:

```js
var domApi = {
  createElement: function(tag) {
    return document.createElement(tag);
  },
  createTextNode: function(text) {
    return document.createTextNode(text);
  },
  appendChild: function(node, child) {
    node.appendChild(child);
  },
  removeChild: function(node, child) {
    node.removeChild(child);
  },
  insertBefore: function(parent, node, before) {
    parent.insertBefore(node, before);
  },
  setTextContent: function(node, text) {
    node.textContent = text;
  },
  parentNode: function(node) {
    return node.parentNode;
  },
  nextSibling: function(node) {
    return node.nextSibling;
  }
};
```

另外，创建一个判断是否为同一个虚拟节点的函数:

```js
// 简单判断两个vnode是否是同一个节点
function sameVnode(oldVnode, vnode) {
  return oldVnode.tag === vnode.tag && oldVnode.key === vnode.key;
}
```

## patch函数

``patch()``函数是对比两个虚拟节点更新视图的入口。由于考虑到第一次挂载的时候oldVnode是DOM元素，需要一个DOM转为vnode的函数:

```js
// 把DOM元素转为简单的vnode
function toVnode(elm) {
  var tag = elm.tagName.toLowerCase();
  return new VNode(tag, {}, [], undefined, elm);
}
```

如果两个虚拟节点不是同一个节点，直接用vnode创建一个DOM元素，替换原来的DOM即可。替换是用新DOM利用``insertBefore()``插入的老DOM的旁边，然后移除老的DOM元素：

```js
function patch(oldVnode, vnode) {
  if (oldVnode.tag === undefined) {
    oldVnode = toVnode(oldVnode);
  }

  if (sameVnode(oldVnode, vnode)) {
    // 进行比对 
    patchVnode(oldVnode, vnode);
  } else {
    var elm = oldVnode.elm;
    var parentElm = domApi.parentNode(elm);

    // 创建DOM元素
    createElm(vnode);

    if (parentElm) {
      // 插入新DOM
      domApi.insertBefore(parentElm, vnode.elm, elm);
      // 移除老的DOM
      removeVnodes(parentElm, [oldVnode], 0, 0);
    }
  }
}
```

## 节点操作函数

增加``createElm()``函数把虚拟节点vnode转为真实的DOM，这里要对虚拟节点的子节点children进行递归转化：

```js
function createElm(vnode) {
  if (vnode.tag) {
    var elm = (vnode.elm = domApi.createElement(vnode.tag));

    if (vnode.children && vnode.children.length) {
      // 递归转化children
      vnode.children.forEach(function(child) {
        domApi.appendChild(elm, createElm(child));
      });
    } else {
      domApi.appendChild(elm, domApi.createTextNode(vnode.text));
    }
  } else {
    // 文本节点
    vnode.elm = domApi.createTextNode(vnode.text);
  }

  return vnode.elm;
}
```

增加``addVnodes()``函数批量插入虚拟节点到真实的DOM中:

```js
function addVnodes(parent, before, vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    var vnode = vnodes[startIdx];
    if (vnode) {
      domApi.insertBefore(parent, createElm(vnode), before);
    }
  }
}
```

增加``removeVnodes()``函数批量删除DOM中的节点:

```js
function removeVnodes(parent, vnodes, startIdx, endIdx) {
  var vnode, elm;
  for (var i = startIdx; i <= endIdx; ++i) {
    vnode = vnodes[i];
    elm = vnode.elm;
    domApi.removeChild(parent, elm);
  }
}
```

## 节点Diff

在``patch(``)函数中如果是同一个节点，我们要进行节点的diff。以下是Diff算法的大概流程:

- 新虚拟节点有文本属性：移除老虚拟节点的子节点，插入新文本。
  
- 新虚拟节点无文本属性：

  - 新节点有children：如果老节点也有children，需要进行下一轮的比对。如果没有children，则清空老节点的文本后插入新节点的children。
  
  - 新节点无children：删除老节点的children或者文本。
  
算法的流程图如下:

<img src="https://blog.inoob.xyz/posts/65181b95/patch.jpg" />

实现节点对比函数``patchVnode()``：

```js
function patchVnode(oldVnode, vnode) {
  if (oldVnode === vnode) return;
  var elm = (vnode.elm = oldVnode.elm);
  var oldCh = oldVnode.children;
  var newCh = vnode.children;

  if (!vnode.text) {
    if (oldCh && newCh) {
      updateChildren(elm, oldCh, newCh);
    } else if (newCh) {
      // 只有新的vnode有children
      if (oldVnode.text) {
        domApi.setTextContent(elm, '');
      }
      addVnodes(elm, newCh, 0, newCh.length - 1);
    } else if (oldCh) {
      // 只有老的vnode有children
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    } else {
      domApi.setTextContent(elm, '');
    }
  } else {
    // 新的vnode为文本节点
    if (oldCh) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    }
    domApi.setTextContent(elm, vnode.text);
  }
}
```

## 子节点的更新

上面我们提到当vnode和oldVnode都有子节点时，需要比对更新子节点。比对的大致流程为循环新的子节点，找出在老子节点中相同的节点：

- 如果找到了，递归调用``patchVnode()``函数进行更新。然后判断是否需要移动子节点。
- 如果没找到则为新增的子节点，创建DOM插入到相应的位置即可。

以上算法的时间复杂度为``O(n^2)``,可以用下面快速查找的方式优化到``O(n)``复杂度。

在每轮循环中，先进行下面4种比较:

- 第一个老子节点和第一个新子节点
- 最后一个老子节点和最后一个新子节点
- 第一个老子节点和最后一个新子节点
- 最后一个老子节点和第一个新子节点

上面的第一个和最后一个都是针对未处理范围的而言。在正确循环体内的子节点都是未处理的。如果上面4种快捷查找都没找到，则遍历查找老的子节点。

很明显，上面的优化策略我们需要4个索引进行跟踪。在退出循环后，存在下面两种情况：

- 如果老子节点存在未处理的，则在DOM中删除这些废弃的节点
- 如果新子节点存在未处理的，则在DOM中批量添加这些新节点

代码实现``updateChildren()``如下：

```js
function updateChildren(parentElm, oldCh, newCh) {
  if (oldCh === newCh) return;
  var oldStartIdx = 0,
    oldEndIdx = oldCh.length - 1,
    oldStartVnode = oldCh[0],
    oldEndVnode = oldCh[oldEndIdx],
    newStartIdx = 0,
    newEndIdx = newCh.length - 1,
    newStartVnode = newCh[0],
    newEndVnode = newCh[newEndIdx],
    oldKeyToIdx,
    idxInOld;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      parentNode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      // 把节点移动到为处理的最后面
      domApi.insertBefore(parentElm, oldStartVnode.elm, oldEndVnode.elm);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      // 把节点移动到未处理的最前面
      domApi.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 老的vnode的key到idx的映射
      // 这里只求出为为处理节点的映射，一点小优化
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToIdx(oldCh, oldStartIdx, oldEndIdx);
      }

      idxInOld = oldKeyToIdx[newStartVnode.key];
      if (idxInOld === undefined) {
        // 子节点是新增的节点
        domApi.insertBefore(parentElm, createElm(newStartVnode), oldStartVnode.elm);
      } else {
        var moveVnode = oldCh[idxInOld];
        if (moveVnode.tag !== newStartVnode.tag) {
          // key相同但是tag不同也为新增
          domApi.insertBefore(parentElm, createElm(newStartVnode), oldStartVnode.elm);
        } else {
          patchVnode(moveVnode, newStartVnode);
          // 把节点移动到未处理的最前面
          domApi.insertBefore(parentElm, moveVnode.elm, oldStartVnode.elm);
          oldCh[idxInOld] = null;
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      // 插入剩余新增的子节点
      var before = newCh[newEndIdx + 1] ? newCh[newEndIdx + 1].elm : null;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
    } else {
      // 删除废弃的子节点
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
}
```

## 参考

[snabbdom 源码阅读分析](https://juejin.im/post/5b9200865188255c672e8cfd#heading-7)