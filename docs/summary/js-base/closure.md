# 函数闭包

闭包是javascript中一个很重要的概念，它利用函数编程的代码风格来实现不同的应用。让我们来看看什么是JS闭包和它的应用场景。

## 什么是闭包

JS闭包是一个能访问其他函数作用域变量的函数变量。我们知道，一个函数执行完后，会清空它自身的执行上下文，包括变量对象和作用域链等。所以函数的局部变量外部环境是访问不了的：

```js
function foo() {
  var a = 1; 
  console.log(a); // 1
}

foo();
console.log(a); // ReferenceError: a is not defined
```

可以利用在foo()函数中返回一个闭包，通过闭包使得外部环境可以正常访问变量a：

```js
function foo() {
  var a = 1;
  return () => {
    console.log(a);
  };
}

const f = foo();
f();  // 1
```

## 闭包的原理

`foo()`函数执行完后，会清空自身的变量对象。那为什么闭包变量在后续还能访问到变量a呢？

这个和函数的作用域链有关。我们知道函数在创建的时候会把最靠近的执行环境的`[[Scopes]]`属性赋值给自身。当函数执行创建活动对象后，会把对象压进`[[Scopes]]`队列的顶部。所以即使函数foo()的执行环境已经移除，但是自身的变量对象还是保存在内存中，被闭包函数的作用域链引用。上面闭包函数的`[[Scopes]]`值为：

```js
[[scopes]] = [AO, foo.AO, global]
```

## 应用

### 解决循环函数赋值

假如为DOM节点循环绑定回调函数，在回调函数里用到外部变量：

```js
var nodes = document.getElementsByName('div');

for (var i = 0; i < 5; i++) {
  nodes[i].onclick = function () {
    console.log(i);
  }
}
```

这段代码并不能得到预期的输出0到4，而不是输出都是5。因为事件回调是异步执行的，在循环后，回调函数外部的变量i已经变成5。执行回调的时候通过作用域链查找到的变量都是同一个。于是，可以用闭包缓存变量i：

```js
var nodes = document.getElementsByName('div');

for (var i = 0; i < 5; i++) {
  nodes[i].onclick = (function(i) {
    return function() {
      console.log(i);
    };
  })(i);
}
```

这个时候执行回调不是查找全局环境的i，而是查找匿名函数的i。所以输出正确的结果。

### 封装变量

闭包可以把一些不需要的全局变量封装成私有变量，防止全局变量冲突。来看下面一个计算乘积的函数：

```js
var cache = {};

function muti() {
  var args = Array.prototype.join.call(arguments, ',');
  if (cache[args]) {
    return cache[args];
  }

  var a = 1;
  for (var i = 0; i < arguments.length; i++) {
    a = a * arguments[i];
  }

  return (cache[args] = a);
}

console.log(muti(1, 2, 3));
console.log(muti(1, 2, 3));
```

在计算过程中我们用cache来缓存计算结果，但是这个变量只是函数`muti()`用到，不如平行封装在同一个函数环境：

```js
var muti = (function() {
  var cache = {};

  return function() {
    var args = Array.prototype.join.call(arguments, ',');
    if (cache[args]) {
      return cache[args];
    }

    var a = 1;
    for (var i = 0; i < arguments.length; i++) {
      a = a * arguments[i];
    }
    return (cache[args] = a);
  };
})();
```

### 延续局部变量的寿命

我们经常利用`img`来上报：

```js
function report(src) {
  var img = new Image();
  img.src = src;
}

report('http://api.wozien.com/report')
```

这个函数的问题就是存在失误上报率。因为函数执行完img变量会被清除，这个时候http有可能还没发出去。可以增加一个数组缓存img变量，通过闭包去访问:

```js
var report = (function() {
  var imgs = [];
  return function(src) {
    var img = new Image();
    imgs.push(img);
    img.src = src;
  };
})();
```

## 参考

[Javascript深入闭包](https://github.com/mqyqingfeng/Blog/issues/9)