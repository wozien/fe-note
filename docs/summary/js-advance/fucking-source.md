各种面试常见手写源码 😏😏😏😏

## 对象深拷贝

```js
const obj1 = {
  name: 'wozien',
  age: 23,
  have: ['house', 'car', 'money', function() {}]
};

function getType(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

function deepCopy(obj) {
  let res,
    type = getType(obj);

  if (type === 'Object') {
    res = {};
  } else if (type === 'Array') {
    res = [];
  } else {
    return obj;
  }

  // 对象每个属性的复制
  for (let key in obj) {
    let value = obj[key];
    if (getType(value) === 'Object' || getType(value) === 'Array') {
      // 递归深拷贝子对象
      res[key] = deepCopy(value);
    } else {
      res[key] = value;
    }
  }

  return res;
}

const obj2 = deepCopy(obj1);
obj2.name = 'marry';
obj2.have[0] = 'aasds';

console.log(obj1);
console.log(obj2);
```

浅拷贝可以用 `Object.assign` 和 `[].slice` 实现

## 数组去重

对象属性标记

```js
const unique = arr => {
  const temp = {};
  return arr.filter(item =>
    temp.hasOwnProperty(typeof item + JSON.stringify(item))
      ? false
      : (temp[typeof item + JSON.stringify(item)] = true)
  );
};
```
在循环中利用 `indexOf` 求出的索引和当前循环索引比较进行过滤，只返回相等的元素。
```js
const unique = arr => arr.filter((e, i) => arr.indexOf(e) === i);
```

es6方法:

```js
const unique = arr => Array.from(new Set(arr));
const unique = arr => [...new Set(arr)];

//利用映射map，该方法的对象标记一个意思。
const unique = arr => {
  const seen = new Map();
  return arr.filter(e => !seen.has(e) && seen.set(e, 1));
};
```

## 数组扁平

通过循环每个元素，如果元素是数组，递归调用扁平函数，并把返回结果 concat 到当前的结果数组中。

```js
const flatten = arr => {
  let res = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      res = res.concat(flatten(arr[i]));
    } else {
      res.push(arr[i]);
    }
  }

  return res;
};
```

toString: 因为多层嵌套的数组调用 `toString` 方法会转换成逗号拼接的字符串。如`[1,[2,[3,4]]]` 会变成1，2，3，4。然后利用 split 分割下丢进返回结果数组。改方法只适用于都是数字的数组。

```js
const flatten = arr => {
  return arr
    .toString()
    .split(',')
    .map(item => +item);
};
```

reduce: 数组的 `reduce` 会循环每个元素，并存储上次的计算结果，最终返回一个值。所以可以利用该函数进行递归的优化。

```js
const flatten = arr => {
  return arr.reduce((pre, e) => {
    return pre.concat(Array.isArray(e) ? flatten(e) : e);
  }, []);
};
```

es6扩展运算符: 因为`[].concat([1,[2,[3,4]]])` 会返回 `[1,2,[3,4]]`。可见，每次调用会扁平一层数组，所以可以循环调用，直到数组不包含数组元素。

```js
const flatten = arr => {
  while (arr.some(e => Array.isArray(e))) {
    arr = [].concat(...arr);
  }
  return arr;
};
```

## 实现 instanceof

```js
function myInstancceOf(obj, Constr) {
  let proto = obj.__proto__

  while(proto) {
    if(proto === Constr.prototype) return true
    proto = proto.__proto__
  }

  return false
}
```

## 实现 new 运算符

```js
function Foo(name) {
  this.name = name
}
 
function myNew(Contr, ...args) {
  const obj = Object.create(Contr.prototype)
  const res = Foo.apply(obj, args) 

  return typeof res === 'object' ? res : obj
}

var foo = myNew(Foo, 'wozien')
console.log(foo)
```

## 实现 call, apply 和 bind

实现 `call`

```js
Function.prototype.myCall = function(context) {
  context = context || window;
  // 这里的属性名应该利用唯一的key，防止覆盖原属性
  // 可以用es6的symbol
  context.fn = this;

  // 获取参数
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']');
  }

  // args自动调用Array.toString方法
  var result = eval('context.fn(' + args + ')');
  delete context.fn;

  return result;
}
```

实现 `apply`:

```js
Function.prototype.myApply = function(context, arr) {
  context = context || window;
  context.fn = this;

  var result;
  if (Object.prototype.toString.call(arr).slice(8, -1) !== 'Array') {
    // 传的不是数组直接调用
    result = context.fn();
  } else {
    var args = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      args.push('arr[' + i + ']');
    }

    result = eval('context.fn(' + args + ')');
  }

  delete context.fn;
  return result;
};
```

实现 `bind`:

```js
Function.prototype.myBind = function(context) {
  if (typeof this !== 'function') {
    throw new Error('Function.prototype.bind - what is trying to be bound is not callable');
  }

  var fn = this;
  var arg1 = Array.prototype.slice.call(arguments, 1);
  var Fnp = function() {};

  var bindfn = function() {
    var arg2 = Array.prototype.slice.call(arguments);

    // 执行原函数，修改this
    fn.apply(this instanceof fn ? this : context, arg1.concat(arg2));
  };

  // 新函数和原函数指向同一个原型
  Fnp.prototype = fn.prototype;
  bindfn.prototype = new Fnp();
  return bindfn;
};
```

## 实现 EventEmitter

```js
function EventEmitter() {
  // 回调函数对象
  this.cbs = {};
}

EventEmitter.prototype.addListener = function(type, listener) {
  if (this.cbs[type]) {
    this.cbs[type].push(listener);
  } else {
    this.cbs[type] = [listener];
  }
};

EventEmitter.prototype.once = function(type, listener) {
  // 处理监听函数，再调用后立即removeListener
  const only = (...arg) => {
    listener.apply(this, arg);
    this.removeListener(type, listener);
  };

  // 这一步是为了能够在移除的时候找到对应的监听函数
  only.origin = listener;
  this.addListener(type, only);
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if (Array.isArray(this.cbs[type])) {
    if (!listener) {
      // 清空所有监听
      delete this.cbs[type];
    } else {
      // 移除通过addListener或者once添加的回调
      this.cbs[type] = this.cbs[type].filter(e => e !== listener && e.origin !== listener);
    }
  }
};

EventEmitter.prototype.emit = function(type, ...args) {
  if (Array.isArray(this.cbs[type])) {
    this.cbs[type].forEach(cb => {
      cb.apply(this, args);
    });
  }
};
```
