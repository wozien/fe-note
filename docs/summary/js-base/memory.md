
# 内存管理

不像**c**语言，在程序运行需要我们手动分配	``malloc`` 和释放内存 ``free``。**javascript**拥有自动的内存管理机制，包括内存的分配，内存的回收。

<!--more-->


## 内存分配

在进入执行上下文，js引擎会为基本类型变量分配一块固定大小的内存块，位于栈区。对于对象变量会在内存堆区分配一块内存，在栈区存的只是这块堆区的内存地址，也称引用。因为堆区是树形结构，可以动态分配大小，符合对象和数组不定大小的特点。还有如果对象存在栈区，空间太大不利于调用栈的上下文切换。

另外对于对象类型的变量之间赋值，只是对堆内存地址的赋值。所以两个变量都指向同一块堆内存，修改其中一个变量，另外一个受影响。

比如下面代码:

```js
function foo(){
    var a = "极客时间"
    var b = a
    var c = {name:"极客时间"}
    var d = c
}
foo()
```

再执行foo时，对应的内存模型如下：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/51127624a725a18a0e12e0f5a7aadbf5.webp)


值得注意的是，闭包能访问到的变量是存在堆区。比如下面代码：

```js

function foo() {
    var myName = "极客时间"
    let test1 = 1
    const test2 = 2
    var innerBar = { 
        setName:function(newName){
            myName = newName
        },
        getName:function(){
            console.log(test1)
            return myName
        }
    }
    return innerBar
}
var bar = foo()
bar.setName("极客邦")
bar.getName()
console.log(bar.getName())
```

大概的执行流程如下：

1. 当 JavaScript 引擎执行到 foo 函数时，首先会编译，并创建一个空执行上下文
2. 在编译过程中，遇到内部函数 setName，JavaScript 引擎还要对内部函数做一次快速的词法扫描，发现该内部函数引用了 foo 函数中的 myName 变量，由于是内部函数引用了外部函数的变量，所以 JavaScript 引擎判断这是一个闭包，于是在堆空间创建换一个“closure(foo)”的对象（这是一个内部对象，JavaScript 是无法访问的），用来保存 myName 变量。
3. 接着继续扫描到 getName 方法时，发现该函数内部还引用变量 test1，于是 JavaScript 引擎又将 test1 添加到“closure(foo)”对象中。这时候堆中的“closure(foo)”对象中就包含了 myName 和 test1 两个变量了。
4. 由于 test2 并没有被内部函数引用，所以 test2 依然保存在调用栈中。

所以在执行foo函数return语句时，对应的内存模型如下：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/f9dd29ff5371c247e10546393c904edb.webp)

当下次执行 bar.setName 或者 bar.getName 时对应的函数上下文中就会包含闭包对象 `closur(foo)`，从而范围到对应的变量。

## 内存回收

内存回收是指js引擎对不再使用的栈堆内存数据进行回收释放，减少系统运行压力。

### 栈内存回收

调用栈中通过ESP指针指向当前正在执行的上下文，当函数执行完后，ESP指针会有一个下移的操作，垃圾回收器会清除ESP指针上层的执行上下文所占的栈空间。

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/b899cb27c0d92c31f9377db59939aaf3.jpg)

### 堆内存回收

JS引擎会把堆空间分为新生代和老生代空间。新生代中存放的是生存时间短的对象，老生代中存放的生存时间久的对象。新生代空间的垃圾回收器叫副垃圾回收器，相反老生代的叫主回收器。

不管哪个回收器，它们的处理流程大致为：
- 标记空间中活动对象和非活动对象
- 回收非活动对象所占据的内存
- 内存整理。防止存在大量的内存碎片，造成内存空间不足

**副垃圾回收器**

该回收器采用 `Scavenge` 算法。 该算法是把新生代空间对半划分为两个区域，一半是对象区域，一半是空闲区域，如下图所示：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/4f9310c7da631fa5a57f871099bfbeaf.webp)

新加入的对象都会存放到对象区域，当对象区域快被写满时，就需要执行一次垃圾清理操作。

在垃圾回收过程中，首先要对对象区域中的垃圾做标记；标记完成之后，就进入垃圾清理阶段，副垃圾回收器会把这些存活的对象复制到空闲区域中，同时它还会把这些对象有序地排列起来，所以这个复制过程，也就相当于完成了内存整理操作，复制后空闲区域就没有内存碎片了。

完成复制后，对象区域与空闲区域进行角色翻转，也就是原来的对象区域变成空闲区域，原来的空闲区域变成了对象区域。这样就完成了垃圾对象的回收操作，同时这种角色翻转的操作还能让新生代中的这两块区域无限重复使用下去。

JavaScript 引擎采用了对象晋升策略，也就是经过两次垃圾回收依然还存活的对象，会被移动到老生区中。

**主垃圾回收器**

除了新生区中晋升的对象，一些大的对象会直接被分配到老生区。因此老生区中的对象有两个特点，一个是对象占用空间大，另一个是对象存活时间长。

主垃圾回收器是采用标记 - 清除`(Mark-Sweep)`的算法进行垃圾回收的。在标记阶段，会从一组根元素开始，递归遍历这组根元素，在这个遍历过程中，能到达的元素称为活动对象，没有到达的元素就可以判断为垃圾数据。

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/6c8361d3e52c1c37a06699ed94652e69.webp)

在垃圾回收阶段，会把标记为垃圾的对象数据进行回收。为了防止碎片，中间还进行内存整理的过程。老生代的垃圾回收过程一般会比较耗时，如果主线程长时间执行垃圾回收，就会导致其他JS任务的阻塞，所以JS引擎采用了增量标记算法，它将标记过程分为一个个的子标记过程，同时让垃圾回收标记和 JavaScript 应用逻辑交替进行，直到标记阶段完成：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/de117fc96ae425ed90366e9060aa14e7.webp)


## 内存泄漏

内存泄漏是指对于不再使用的内存，没有及时回收。一般的内存泄漏都是不必要的引用造成，比如下面几种情况：

**意外的全局变量**

在函数内没有声明变量直接使用或者 ``this`` 的不正确使用：

```js
function func() {
   a = 1;
   this.b = 2; 
}

func()
```
可以在文件头加上``'use strict'``, 使用严格模式避免意外的全局变量。如果必要要使用全局变量来存数据，使用完后要设置成 ``null``。

**没有清除定时器和事件回调**

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

**超出dom的引用**

假设a是对一个表格节点的引用。

```js
var a = document.getElementById('td1')
var b = document.getElementById('table2')

document.body.removeChild(b)
b = null
```

上面的情况即使移除了包含 ``td`` 节点的整个表格，但是变量a引用了``td``节点，子节点又引用了父节点，所以在内存中的``table``节点空间不会被回收。

**不正当的使用闭包**

因为闭包变量是不会被内存回收的，所以如果闭包引用了一些不必要的变量或者引用的变量很大，都会影响性能的。

## 内存泄漏排查

**使用浏览器的``devTools``**

chrome浏览器f12->memory, 点击保存堆内存快照，重点关注下面几点

<img src="http://blog.inoob.xyz/posts/f616d4a/1.png" width="700">

- ``shallow size``: 对应的类对象所占用的堆内存，不包含属性的引用的内存
- ``retained size``: 对应的类对象所占用的堆内存，包含属性的引用的内存

然后模拟用户操作，再次保存堆内存快照，切换第二张快照的 ``comparsion``对比视图：

<img src="http://blog.inoob.xyz/posts/f616d4a/2.png" width="700">

可以看出新增和删除的内存的大小。如果多次快照的内存都是不断上升，那么就可能存在内存泄漏。

**使用WeakMap**

对于某些不想关注的引用，又不让它影响内存回收机制，可以是设置成 ``WeakMap`` 对象的键值对。

## 参考文章

[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)

[https://juejin.im/post/5b10ba336fb9a01e66164346](https://juejin.im/post/5b10ba336fb9a01e66164346)

[https://segmentfault.com/a/1190000011231206](https://segmentfault.com/a/1190000011231206)

[https://github.com/yygmind/blog/issues/16](https://github.com/yygmind/blog/issues/16)

[http://www.ruanyifeng.com/blog/2017/04/memory-leak.html](http://www.ruanyifeng.com/blog/2017/04/memory-leak.html)