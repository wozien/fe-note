# 生成器Generator

迭代器是es6中一个重要的概念，很多新特性都是基于迭代器概念而铺开的。为了更加方便的创建自定义的迭代器，es6引入了生成器 ``(Generator)`` 的概念。它是一种可以返回迭代器的特殊函数。有了生成器及它的特性可以让我们创建更加简洁的异步代码。

<!--more-->

## 基本概念

通过 ``function`` 关键字后面的星号``(*)``来表示，函数体用 ``yield`` 关键字来控制迭代器每次 ``next()`` 返回结果：

```js
function* createIterator() {
  yield 1;
  yield 2;
  yield 3;
}

let iterator = createIterator();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

通过生成器生成的迭代器每次调用 ``next()``执行函数代码时 ，每次执行 ``yield`` 语句完后就会自动停止执行。直到再次调用 ``next()`` 方法才会继续执行。

```js
function* createIterator() {
  console.log(1);
  yield;
  console.log(2);
  yield;
  console.log(3);
}

let iterator = createIterator();

iterator.next(); // 1
iterator.next(); // 2 
```

``yield`` 关键字只能在生成器内部使用，嵌套的函数也不行：

```js
function* createIterator(items) {
  items.forEach(function (item) {
    //  SyntaxError: Unexpected identifier
    yield item;
  })
}
```

在对象里面定义生成器函数：

```js
let obj = {
  createIterator: function* (items) {
    // ...
  }
}

// 用es6方式
let obj = {
  *createIterator(items) {
    // ...
  }
}
```

> *注意，生成器函数不支持箭头函数写法*

## 高级迭代器用法

### 迭代器传参

可以给迭代器 ``next()`` 方法传递一个参数，这个参数的值会替代生成器内部上一条``yield`` 语句的返回值：

```js
function* createIterator() {
  let first = yield 1;
  let second = yield first + 2;
  yield second + 3;
}

let iterator = createIterator();

console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next(3)); // { value: 5, done: false }
console.log(iterator.next(5)); // { value: 8, done: false }
console.log(iterator.next());  // { value: undefined, done: true }
```

第二次调用 ``next()`` 传入4，会作为上一条 ``yield`` 语句的返回值，此时first的值为3，而不是1，所以第二次 ``next`` 的返回值为5。以此类推，第3次 ``next()``传入5，返回值为8。

注意，第一次调用 ``next()`` 传入参数会被忽略。运行的流程可以如下图：

<img src="https://blog.inoob.xyz/posts/33ce65af/1.jpg" />

### 在迭代器抛出错误

迭代器除了 ``next()`` 方法，还有利用 ``throw()`` 抛出一个Error对象。错误被抛出后，生成器函数的后面代码会停止执行：

```js
function* createIterator() {
  let first = yield 1;
  let second = yield first + 2;
  yield second + 3;
}

let iterator = createIterator();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next(3)); // { value: 5, done: false }
console.log(iterator.throw(new Error('boom'))); // 从生成器中抛出错误
```

在生成器函数内可以用 ``try...catch`` 来捕捉错误，后续代码才能继续执行：

```js
function* createIterator() {
  let first = yield 1;
  let second;

  try {
    second = yield first + 2;
  } catch (e) {
    second = 6;
  }

  yield second + 3;
}

let iterator = createIterator();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next(3)); // { value: 5, done: false }
console.log(iterator.throw(new Error('boom'))); // { value: 9, done: false }
console.log(iterator.next());   // { value: undefined, done: true }
```

### 生成器返回值

因为生成器也是一个函数，所以可以用 ``return`` 返回值。在 ``return`` 后，结果对象的done立即变为 ``true``，value为返回的值。后续 ``yield`` 语句将不会执行：

```js
function* createIterator() {
  yield 1;
  return 'done';
  yield 2;
}

let iterator = createIterator();

console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 'done', done: true }
console.log(iterator.next());  // { value: undefined, done: true }
```

``return`` 返回值只获取一次，后续调用 ``next()`` 都是返回 ``undefiend``。

### 委托生成器

委托生成器是指在生成器的内用 ``yield*`` 语法接上另外一个生成器函数，把数据生成的过程委托给其他迭代器：

```js
function* createNumber() {
  yield 1;
  yield 2;
}

function* createColor() {
  yield 'red';
}

function* combine() {
  yield* createNumber();
  yield* createColor();
  return 'combine';
}

let iterator = combine();
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 'red', done: false }
console.log(iterator.next());  // { value: 'combine', done: true }
```

## 异步任务执行

我们用 ``setTimeout()`` 来模拟一个异步任务：

```js
function fetchData(url, cb) {
  setTimeout(() => {
    cb({ code: 0, data: url });
  }, 1000);
}
```

把上面的函数改成返回可以接收回调的函数：

```js
function fetchData(url) {
  return (cb) => {
    setTimeout(() => {
      cb({ code: 0, data: url });
    }, 1000);
  }
}
```

我们有一个异步任务的生成器函数：

```js
function* gen() {
  let res1 = yield fetchData('http://www.baidu.com');
  let res2 = yield fetchData('http://www.inoob.xyz');
  console.log(res1.data + ' ' + res2.data);
}
```

要让上面的生成器函数正确执行，我们需要这样调用：

```js
let g = gen();

g.next().value(function(data) {
  var r2 = g.next(data);
  r2.value(function(data) {
    g.next(data);
  });
});
```

通过在回调函数的执行把控制权重新回到生成器函数，继续执行函数到下一条 ``yield``。我们用递归的方式改写执行函数：

```js
function run(gen) {
  let g = gen();

  function next(data) {
    let result = g.next(data);

    if (result.done) return;

    if (typeof result.value === 'function') {
      result.value(next);
    } else {
      next(result.value);
    }
  }

  next();
}

run(gen);
```

其实，上面的自动执行生成器函数的方法只适用于回调形式的异步任务，还要考虑返回``Promise`` 形式的异步任务，并且要处理异常的情况。这里推荐一个npm库，该库已经兼容所有情况自动执行 ``Generator``函数。


## 参考

[ES6 系列之 Generator 的自动执行](https://github.com/mqyqingfeng/Blog/issues/99)