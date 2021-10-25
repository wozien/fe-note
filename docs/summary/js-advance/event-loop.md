
# 事件循环

我们知道，javascript运行是单线程的。这是由于javascript作为浏览器脚本语言，尽可能降低运行的复杂度。比如操作浏览器的 ``DOM``，要是允许多个线程去修改的话，浏览器就不知道以哪个线程为主。

<!--more-->

如果是单线程，遇到多任务的时候就会造成阻塞。比如 ``ajax`` 发送请求，我们要等到请求结果返回，才能执行后续代码。而我们发现javascript是非阻塞的，它允许我们为请求注册回调函数，然后继续执行后续的代码，等请求结果返回后再处理回调函数。这内部的实现就是靠javascript的事件循环机制(EventLoop) ,它是让浏览器或者 ``Node`` 单线程运行JS而不会阻塞的关键。

## 一些术语

主线程：运行js代码的主要线程

执行栈：可以理解为执行js代码时候的环境，执行时入栈，执行后出栈

同步任务：可以直接在执行栈执行的代码，无需等待

异步任务：不能直接在执行栈执行，需交给异步模块处理。可分为宏任务 ``macro task`` 和微任务 ``micro task``。

- 宏任务： ``I/O任务``,``setTimeout``, ``setInterval``, ``UI Render``, ``setImmediate(Node)``

- 微任务： ``process.nextTick(Node)``, ``Promise``

任务队列： 存放异步任务结果事件的队列，由主线程读取对应事件的回调，放到执行栈执行。

## 运行过程

主线程进入全局环境开始运行，判断任务是否是异步任务。不是话直接丢进执行栈，执行完出栈。如果是异步任务，交给异步模块处理。

<img src="http://blog.inoob.xyz/posts/d33ba0d2/2.png" width="500"/>

当异步任务条件达成，比如 ``I/O`` 结果返回，定时结束等，会push一个对应的事件到任务队列。入队列的时候会根据任务类型加到对应的队列，比如 ``micro task`` 会放到微任务队列 ``micro queue``， ``macro task`` 会放到宏任务队列 ``macro queue``。所以任务队列如下：

<img src="http://blog.inoob.xyz/posts/d33ba0d2/1.png" />

当主线程执行完执行栈的代码，就会去读取任务队列的事件。读取的时候会优先检测里面的 ``micro queue``有没事件，有就执行对应事件的回调。直到 ``micro queue`` 的事件对应的回调都处理完, 才会去读取 ``macro queue`` 的事件，在执行宏任务的过程也会产生异步任务，同理它们会放到对应的队列。当这个宏任务执行完后，并不会去执行下一个红任务，而是去检测 ``micro queue`` 有没有事件。有就重复上面的过程，没有才执行下一个宏任务。

一句话，每次事件循环，总优先清理 ``micro queue`` 的内容，再去处理 ``macro queue``。

## 代码测试

执行下面测试代码：

```js
setTimeout(() => {
    console.log('time1');
    Promise.resolve().then(() => {
        console.log('promise1');
    })   
});

setTimeout(() => {
    console.log('time2');
    Promise.resolve().then(() => {
        console.log('promise2');
    })   
});

console.log('start');
```

一开始，主线程判断是两个定时的异步任务，记为 ``st1`` 和 ``st2``，于是交给异步模块处理，然后再输出start。异步模块会把 ``st1`` 和 ``st2`` 放到宏任务队列，主线程在输出后执行栈为空，就会去读取 	``st1`` 对应的回调执行，输出time1后遇到 ``Promise`` 微任务，交给异步模块进入微任务队列。此时主线程读取队列的时候就先读取微任务队列的事件，所以会输出promise1，而不是time2。所以的输出结果为：start time1 promise1 time2 promise2

操作队列的流程如下图：

<img src="https://user-gold-cdn.xitu.io/2019/1/18/16860ae5ad02f993?imageslim"/>

## 参考文章

[JavaScript 运行机制详解：再谈Event Loop - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)

[一次弄懂Event Loop（彻底解决此类面试问题） - 掘金](https://juejin.im/post/5c3d8956e51d4511dc72c200)

[事件循环机制的那些事](https://mp.weixin.qq.com/s/9_hZX_xWSr3Gd1X_2_WOsA)