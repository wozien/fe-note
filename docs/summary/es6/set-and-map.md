# 认识Set和Map

在es5中经常用对象来实现集合``set`` 和映射 ``map`` 的数据结构，但是这种方式有一些弊端。比如实现集合时，我们不能用 ``if(set.count)`` 判断某个元素是否确切存在。在集合中，属性5和'5'会被当作同一个键，还有不能使用对象作为键，因为会转为``[object object]``。所以，es6提供了两种新的数据解构：``Set`` 集合和``Map`` 映射。

<!--more-->

## Set集合

通过 ``new Set()`` 创建一个空的集合，通过 ``add()`` 方法往集合添加元素：

```js
let set = new Set();
set.add(5);
set.add('5');

console.log(set); // Set { 5, '5' }
```

添加进集合的元素会自动去重，并且内部使用 ``Object.is()`` 方法来判断两个元素是否相等，但是+0和-0除外，他们在集合中被视为相等：

```js
let set = new Set();
set.add(5);
set.add('5');
set.add(5);

console.log(set.size); // 2
```

集合可用具有迭代器接口的数据进行初始化，比如用一个数组：

```js
let set = new Set([1, 2, 2, 3, 4, 5, 5]);

console.log(set); // Set { 1, 2, 3, 4, 5 }
```

另外一些集合的方法：

- ``has(key)``: 判断某个值是否存在
- ``delete(key)``: 移除集合某一个元素
- ``clear()``: 清除集合的所有元素

```js
let set = new Set();
set.add(5);
set.add('5');

console.log(set.has(5)); // true

set.delete(5);
console.log(set.has(5)); // false
console.log(set.size);  // 1

set.clear();
console.log(set.size);  // 0
```

类似数组，集合``Set`` 也有 ``forEach`` 方法，第一个参数为循环的函数，第二个参数为绑定这个函数的 ``this`` 对象。对于循环函数的参数，第一个和第二个都为集合每个循环元素：

```js
let set = new Set([1, 2]);

set.forEach((value, key, own) => {
  console.log(key + ' ' + value);
  console.log(own === set);
});
// 1 1
// true
// 2 2
// true
```

## Map映射

用 ``new Map()`` 新建一个空的映射，通过 ``set()`` 方法添加键值对，``get()`` 方法获取对应键的值：

```js
let map = new Map();

map.set('title', 'ECMA 2016');
map.set('year', 2016);

console.log(map.get('title')); // ECMA 2016
console.log(map.get('year')); // 2016
```

在 ``Map`` 集合中，允许对象作为键：

```js
let map = new Map();
let key1 = {},
  key2 = {};

map.set(key1, 4).set(key2, 34);

console.log(map); // Map { {} => 4, {} => 34 }
console.log(map.get(key1)); // 4
```

可以向 ``Map`` 构造函数传一个数组来初始化。数组的子元素是包含键和值两个元素的数组：

```js
let map = new Map([['name', 'wozien'], ['age', 25]]);
console.log(map); // Map { 'name' => 'wozien', 'age' => 25 }
```

``Map`` 和 ``Set``一样拥有 ``has(key)``, ``clear()``, ``delete(key)``三个方法，并且拥有 ``size`` 属性，表示键值对的个数：

```js
let map = new Map();
map.set('name', 'wozien');
map.set('age', 25);

console.log(map.size); // 2
console.log(map.has('name')); // true

map.delete('name');
console.log(map.has('name'));  // false

map.clear();
console.log(map.size);  // 0
```

## WeakSet和WeakMap

``WeakSet`` 表示弱引用集合，什么是弱引用，来看一个例子：

```js
let set = new Set();
let obj = {};

set.add(obj);
console.log(set.size);  // 1

obj = null;
console.log(set.size); // 1
```

上面的代码先在集合插入一个对象，然后把这个对象的引用obj设置 ``null``，清除了对该对象的引用。从集合的元素个数不变可以看出，该对象的内存并没有被回收，也就是说集合set仍然引用着这个对象，也称强引用。

相对的，如果存在一种集合，在外部的引用都不存在时，集合的对象会自动被垃圾回收，该集合就可以称为对该对象的弱引用。``WeakSet`` 的作用就是这样：

```js
let set = new WeakSet();
let obj = {};

set.add(obj);
console.log(set.has(obj)); // true

obj = null;
console.log(set.has(obj)); // false
```

类似的，``WeakMap`` 叫做弱引用Map，它的键名必须为一个对象，否则会报错：

```js
let set = new WeakMap();
let obj = {};

set.set(obj, 1);
console.log(set.has(obj)); // true

obj = null;
console.log(set.has(obj)); // false
```

``WeakSet`` 和 ``WeakMap`` 不支持 ``clear()`` 和 ``forEach()`` 方法。因为垃圾回收执行不能预测，所谓两者都没有 ``size`` 属性。

```js
let set = new WeakMap();
let obj = {};

set.set(obj, 1);
console.log(set.size); // undefined
```

## 应用

利用``Set`` 进行数组去重：

```js
let arr = [1, 2, 2, 3, 4, 4, 5];

arr = [...new Set(arr)];

console.log(arr);  // [ 1, 2, 3, 4, 5 ]
```

利用 ``WeakMap`` 记录DOM元素的额外信息，并随着DOM的移除自动清除：

```js
let wm = new WeakMap(), element = document.querySelector(".element");
wm.set(element, "data");

let value = wm.get(elemet);
console.log(value); // data

element.parentNode.removeChild(element);
element = null;
```

除了``Symbol`` 外，我们同样可以利用 ``WeakMap`` 实现对象的私有属性：

```js
let privateData = new WeakMap();

class Person {
  constructor(name) {
    privateData.set(this, { name });
  }

  getName() {
    return privateData.get(this).name;
  }
}

let person = new Person('wozien');
console.log(person.getName()); // wozien
```

## 参考

[ES6 系列之 WeakMap](https://github.com/mqyqingfeng/Blog/issues/92)