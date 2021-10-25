
函数的柯里化是指对多个参数的函数转换成一系列单个参数的函数调用的技术。它在我们开发过程虽然不经常用，但是某些场景会让提高我们代码的复用性。``loadsh`` 库的 ``_.currry`` 就是对函数进行柯里化处理。

<!--more-->

## 前言

函数柯里化是函数式编程中提出的概念。因为函数式编程会涉及到一系列函数组合调用的情况，即把一个函数的返回值作为另一个函数的参数。对于这种方式，单个参数的函数很好处理。

```js
const compose = function (f, g) {
  return function (x) {
    return f(g(x));
  };
}
```
但对于多个参数的情况就比较复杂了。所以可以利用函数的柯里化，先把函数转为单个参数调用，再进行函数的组合。来看下一个柯里化处理的简单例子。

```js
// 求和函数
const add = (a, b) => a + b;

// 柯里化后的求和
const curryAdd = a => b => a + b;

console.log(add(1, 2));
console.log(curryAdd(1)(2));
```
对于函数式编程的分析，可看这篇文章[函数式编程入门教程](http://www.ruanyifeng.com/blog/2017/02/fp-tutorial.html)。

## 手动实现

函数柯里化的实现简单概括起来就是：**用闭包把参数保存起来，当参数的数量足够执行函数了，就开始执行函数**。所以可以分为下面两步：

- 判断参数的数量是否大于等于函数的参数数量。如果是，则执行函数
- 如果不是，则返回一个闭包，暂存传入的参数，并返回柯里化函数。

```js
// 柯里化处理函数
function currying(fn, ...args) {
  if (args.length >= fn.length) {
    return fn(...args);
  } else {
    return (...args2) => currying(fn, ...args, ...args2);
  }
}

const curryAdd = currying(add);
console.log(curryAdd(1)(2));   //3
```

## 应用场景

### 复用函数参数

对于多个参数的函数调用，如果存在几个不变的参数值，我们每次调用都要重写一遍。利用柯里化可以先保存不变的参数，可变参数传给柯里化后的函数即可。

```js
function getUrl(protocol, host, path) {
  return `${protocol}://${host}/${path}`;
}

const page1 = getUrl('http', 'localhost', 'page1');
const page2 = getUrl('http', 'localhost', 'page2');
```
柯里化处理

```js
const curryPage = currying(getUrl, 'http', 'localhost');
const page1 = curryPage('page1');
const page2 = curryPage('page2');
```

### 优化map等函数回调

先看一个获取对象数组每个属性值的情况

```js
const persons = [{ name: 'kevin', age: 11 }, { name: 'daisy', age: 24 }];
const names = persons.map(item => item.name);   // [ 'kevin', 'daisy' ]
```
如果我们想要获取age属性，就必须重新写一个匿名函数。所以，我们对一个获取函数对象属性的函数进行柯里化，结果作为 ``map`` 的回调函数。

```js
const persons = [{ name: 'kevin', age: 11 }, { name: 'daisy', age: 24 }];

// 经过柯里化后的获取对象对应值的函数
const getProp = currying((key, obj) => obj[key]);

// 获取name属性
const names = persons.map(getProp('name'));
// 获取age属性
const ages = persons.map(getProp('age'));

console.log(names);  // [ 'kevin', 'daisy' ]
console.log(ages);   // [ 11, 24 ]
```

## 参考

[coding-in-js](http://www.conardli.top/docs/JavaScript/%E5%87%BD%E6%95%B0%E6%9F%AF%E9%87%8C%E5%8C%96.html#%E5%AE%9A%E4%B9%89)
[https://github.com/mqyqingfeng/Blog/issues/42](https://github.com/mqyqingfeng/Blog/issues/42)