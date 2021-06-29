# 迭代器Iterator

用 ``for`` 循环语句来迭代数据时，需要初始化一个变量来记录每一次的迭代位置，但嵌套循环时就会变得繁琐。于是，es6引入了迭代器和 ``for...of`` 的概念来简化数据迭代操作。

<!--more-->

## 基本概念

**迭代器**是一种特殊的对象，它具有 ``next()`` 方法，每次调用返回一个结果对象。该对象包含两个属性，value表示下一次返回的值，done表示迭代是否结束，为 ``bool``值。我们模拟实现产生迭代器的函数：

```js
function createIterator(items) {
  let i = 0;
  return {
    next() {
      let done = i >= items.length;
      let value = !done ? items[i++] : undefined;

      return { done, value };
    }
  };
}

let iterator = createIterator([1, 2, 3]);

console.log(iterator.next());  // { done: false, value: 1 }
console.log(iterator.next());  // { done: false, value: 2 }
console.log(iterator.next());  // { done: false, value: 3 }
console.log(iterator.next());  // { done: true, value: undefined }
```

**可迭代对象**是指具有 ``Symbol.iterator`` 属性的对象，该属性值是一个返回迭代器的函数。在es6中，所有集合对象(数组，``Set`` 集合和 ``Map`` 集合)和字符串都是可迭代对象，都有默认的迭代器，即有 ``Symbol.iterator`` 属性值。

我们可以为对象增加 ``Symbol.iterator`` 属性来自定义创建一个可迭代对象：

```js
// 省略createIterator代码

let obj = {
  items: [],
  push(x) {
    this.items.push(x);
    return this.items;
  },
  [Symbol.iterator]() {
    return createIterator(this.items);
  }
};
```

对于可迭代对象的遍历es6给我们提供了 ``for...of`` 语句，来看一个例子：

```js
let arr = [1, 2, 3];
for (let x of arr) {
  console.log(x);
}
// 1
// 2
// 3
```

其实 ``for...of`` 每一次循环会调用可迭代对象的 ``Symbol.iterator`` 方法生成的迭代器的 ``next()`` 方法，并把结果对象的value值赋给变量，直到done的值为``true`` 。我们用 ``for...of`` 访问自定义的迭代对象：

```js

// ...

obj.push(1).push(2);

for (let x of obj) {
  console.log(x);
}

// 1
// 2

```

## 内建迭代器

为了更好的访问数组，``Set`` 集合和 ``Map`` 集合，es6为这3种对象提供了内置迭代器：

- ``entries()``: 返回一个迭代器，值为包含键和值两个元素的数组
- ``keys()``: 返回一个迭代器，值为集合的键
- ``values()``: 返回一个迭代器，值为集合的值

我们来看数组的例子：

```js
let arr = [1, 2, 3];

for (let key of arr.keys()) {
  console.log(key);
}
// 0
// 1
// 2

for (let value of arr.values()) {
  console.log(value);
}
// 1
// 2
// 3

for (let entry of arr.entries()) {
  console.log(entry);
}
// [ 0, 1 ]
// [ 1, 2 ]
// [ 2, 3 ]
```

``Map`` 集合的结果和上面类似，只是``Set`` 集合的键和值都是一样的，所以``keys()`` 和 ``values()`` 是等价的。

不同的集合有自己默认的迭代器。数组和 ``Set`` 使用 ``values()`` 方法返回的迭代器，而``Map`` 集合是用 ``entries()`` 方法：

```js
let map = new Map([['name', 'wozien'], ['age', 23]]);

for (let entry of map) {
  console.log(entry);
}

// [ 'name', 'wozien' ]
// [ 'age', 23 ]
```

可用数组解构的方式来处理迭代的返回值：

```js
let map = new Map([['name', 'wozien'], ['age', 23]]);

for (let [key, value] of map) {
  console.log(key + ' ' + value);
}

// name wozien
// age 23
```

在之前我们可以用展开运算符 ``(...)`` 把 ``Set`` 集合转为一个数组，其实展开运算符可作用于任何可迭代对象，它会把迭代器 ``next()`` 方法的返回值按顺序插入到数组中:

```js
let map = new Map([['name', 'wozien'], ['age', 23]]);
let arr = [...map];

console.log(arr); // [ [ 'name', 'wozien' ], [ 'age', 23 ] ]
```

作用于自定义的迭代对象：

```js

// 省略createIterator代码

let obj = {
  [Symbol.iterator]() {
    return createIterator([1, 2, 3]);
  }
};

let arr = [...obj];

console.log(arr);  // [ 1, 2, 3 ]
```

## 生成可迭代对象

上面的除了手动实现 ``createIterator()`` 函数外，es6为我们提供了生成器``(Generator)``，方便我们生成迭代器。通过在 ``function`` 关键字后的星号``(*)``来表示，在函数体内用 ``yield`` 关键字控制迭代器 ``next()`` 的返回值：

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

console.log(iterator.next());  // 1   { value: undefined, done: false }
console.log(iterator.next());  // 2   { value: undefined, done: false }

```

有了生成器，我们可以改写自定义的可迭代对象：

```js
let obj = {
  items: [],
  push(x) {
    this.items.push(x);
    return this.items;
  },
  [Symbol.iterator]: function*() {
    for (let item of this.items) {
      yield item;
    }
  }
};

obj.push(1).push(2);

for (let x of obj) {
  console.log(x);
}

// 1  2
```

或者可以用es6定义对象函数的方式：

```js
let obj = {
  // ...
  *[Symbol.iterator]() {
    for (let item of this.items) {
      yield item;
    }
  }
};
```

更多关于生成器的说明，参考下一篇[es6-生成器Generator]()

## 参考

[ES6 系列之迭代器与 for of](https://github.com/mqyqingfeng/Blog/issues/90)