
# 内存管理

不像**c**语言，在程序运行需要我们手动分配	``malloc`` 和释放内存 ``free``。**javascript**拥有自动的内存管理机制，包括内存的分配，内存的回收。

<!--more-->


## 内存分配

在进入执行上下文，js引擎会为基本类型变量分配一块固定大小的内存块，位于栈区。对于对象变量会在内存堆区分配一块内存，在栈区存的只是这块堆区的内存地址，也称引用。因为堆区是树形结构，可以动态分配大小，符合对象和数组不定大小的特点。

另外值得注意的是，闭包能访问到的变量是存在堆区。

对于对象类型的变量之间赋值，只是对堆内存地址的赋值。所以两个变量都指向同一块堆内存，修改其中一个变量，另外一个受影响。

如下测试代码：

```js
var a = {n: 1};
var b = a;
a.x = a = {n: 2};

console.log(a.x)  // undefined
console.log(b.x)   // {n:2}
```

- 第一步，变量a被赋值为对象 ``{n:1}``，并且指向它
- 然后把a赋值b，b也指向对象 ``{n:1}``
- 最后比较复杂，它要考虑js中左查询优先于右查询。所以``a.x`` 先执行，因为对一个不存在的对象属性取值，如果不存在会默认为 ``undefined``，所以a和b指向对象变成了``{n:1,x:undefined}``，然后等待赋值表达式赋值。其次，赋值表达式从右到左，a指向了``{n:2}``,然后原来指向内存对象的x属性也被赋值为 ``{n:2}``

给对象类型的变量赋予 ``null``，会让它和原来指向的堆内存断开关系，使得堆内存数据的引用数减一。

## 内存回收

内存回收是指js引擎对不再使用的堆内存数据进行回收释放，减少系统运行压力。比如函数上下文执行完，局部的变量会被默认赋予``null``，并且回收。对于全局上下文，除非网页关闭，不然会常驻内存。这就是不提倡声明全局变量的原因。

如何判断一个对象不再使用，这就是js的内存回收算法。一般包括引用计数法和标记清除法。

### 引用计数法

这是一个基本废弃的算法，目前低版本IE浏览器还在使用。它是指如果一个对象存在一个引用指向它，该对象的引用计数就加1。内存会回收引用次数为0的对象。

但是这种方式存在一种缺陷，就是对于循环引用的内存，永远无法回收，造成内存泄漏。比如：

```js
function circleReferrer() {
    var o1 = {}
    var o2 = {}
    o1.a = o2   // o2被引用
    o2.a = o1    // o1被引用
}

circleReferrer()
```

### 标记清除

现代浏览器都是基于该回收算法。它是指可以从js全局对象访达的对象标记为活跃状态，下一次内存会回收没有标记的对象。所以不再引用的对象一定不能访问，但是反过来就不一定了。

正常情况下，正在处于执行环境的变量是不会被回收，因为程序还可能要用到这些变量，只有离开执行环境才有可能被回收，但是闭包变量除外。因为闭包变量永远可以通过闭包函数访问到，使的标记一直存在。如下：

```js
var closure = (function(){
    var obj = {a:1}
    return function() {
        console.log(obj.a)
    }
})()

closure()   // 1

setTimeout(() => {
    closure()
}, 1000)    // 1
```

可以令 ``closure = null``, 使得闭包函数不存在引用，从而对象 ``obj`` 无法访达，下次会被内存回收。

这种算法很好解决了循环引用问题。比如上面循环引用的例子，在函数``circleReferrer``执行完后，对象o1和o2无法再次访问。因为重新调用一个函数是新分配的对象，所以会被内存回收。

## 内存泄漏

内存泄漏是指对于不再使用的内存，没有及时回收。一般的内存泄漏都是不必要的引用造成，比如下面几种情况：

**意外的全局变量**。

在函数内没有声明变量直接使用或者 ``this`` 的不正确使用：

```js
function func() {
   a = 1;
   this.b = 2; 
}

func()
```
可以在文件头加上``'use strict'``, 使用严格模式避免意外的全局变量。如果必要要使用全局变量来存数据，使用完后要设置成 ``null``。

** 没有清除定时器和事件回调 **

```js
var a = {name: 'zzz'}

setInterval(function() {
  var dom = document.getElementById('div')

  if(dom) {
      dom.innerText = JSON.stringify(a)
  }
},1000)
```

上面代码即使节点被移除，但是定时器在运行，保存着对对象的引用。解决办法就是在dom不存在的时候清除定时器。

```js
var btn = document.getElementsByTagName('button')
btn.onclick = function() {
    console.log('hello')
}

document.body.removeChild(btn)
```

上面的情况在IE版本还要对事件回调解除引用，现代浏览器可不用考虑。因为他会认为节点移除后，回调是永远不会被触发的。

** 超出dom的引用 **

假设a是对一个表格节点的引用。

```js
var a = document.getElementById('td1')
var b = document.getElementById('table2')

document.body.removeChild(b)
b = null
```

上面的情况即使移除了包含 ``td`` 节点的整个表格，但是变量a引用了``td``节点，子节点又引用了父节点，所以在内存中的``table``节点空间不会被回收。

** 不正当的使用闭包 **

因为闭包变量是不会被内存回收的，所以如果闭包引用了一些不必要的变量或者引用的变量很大，都会影响性能的。

## 内存泄漏排查

** 使用浏览器的``devTools`` **

chrome浏览器f12->memory, 点击保存堆内存快照，重点关注下面几点

<img src="http://blog.inoob.xyz/posts/f616d4a/1.png" width="700">

- ``shallow size``: 对应的类对象所占用的堆内存，不包含属性的引用的内存
- ``retained size``: 对应的类对象所占用的堆内存，包含属性的引用的内存

然后模拟用户操作，再次保存堆内存快照，切换第二张快照的 ``comparsion``对比视图：

<img src="http://blog.inoob.xyz/posts/f616d4a/2.png" width="700">

可以看出新增和删除的内存的大小。如果多次快照的内存都是不断上升，那么就可能存在内存泄漏。

** 使用WeakMap **

对于某些不想关注的引用，又不让它影响内存回收机制，可以是设置成 ``WeakMap`` 对象的键值对。

## 参考文章

[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)

[https://juejin.im/post/5b10ba336fb9a01e66164346](https://juejin.im/post/5b10ba336fb9a01e66164346)

[https://segmentfault.com/a/1190000011231206](https://segmentfault.com/a/1190000011231206)

[https://github.com/yygmind/blog/issues/16](https://github.com/yygmind/blog/issues/16)

[http://www.ruanyifeng.com/blog/2017/04/memory-leak.html](http://www.ruanyifeng.com/blog/2017/04/memory-leak.html)