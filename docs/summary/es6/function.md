# 函数扩展

在es6中更新了很多函数的特性。其中在开发常用的有参数默认值，不定参数，展开运算符和箭头函数等。

<!--more-->

## 参数默认值

在es5函数的默认值是用``||``实现:

```js
function func(url, timeout, cb) {
  timeout = timeout || 2000;
  cb = cb || function() {};

  console.log(url, timeout, cb);
}

func('a.com');  // a.com 2000 function() {}
func('b.com', 0);  // b.com 2000 function() {}
```

这种方式可以看出如果参数传递一个转为``boolean``值为``false``的情况都会用默认值。除非在函数里面判断参数是否为``undefiend``再使用默认值。

在es6中，可以直接在参数列表直接用``=``赋值方式定义默认值：

```js
function func(url, timeout = 2000, cb = function() {}) {
  console.log(url, timeout, cb);
}

func('a.com'); // a.com 2000 function() {}
func('b.com', 0); // b.com 0 function() {}
```

上面的代码在不传或者传入``undefiend时``才使用默认值。

默认值可以使用函数调用的方式。当函数调用是才会执行参数的默认值函数，声明是不执行：

```js
let value = 5;

function getValue() {
  return value++;
}

function add(a, b = getValue()) {
  return a + b;
}

console.log(add(1)); // 6
console.log(add(1)); // 7
console.log(add(1, 2)); // 3
```

默认值允许使用左边先声明的参数变量，不允许使用后面的参数，因为此时处于临时死区。

```js
function getValue(value) {
  return value;
}

function add(a, b = getValue(a)) {
  return a + b;
}

console.log(add(1)); // 2
console.log(add(1, 2)); // 3
```

## 剩余参数

当函数调用当参数比声明时多，要访问声明的参数可以遍历``arguments``。在es6中，提供剩余参数这一特性，用``...args``表示，args表示多余参数的数组：

```js
function func(a, ...args) {
  console.log(args);  // [2,3]
  return args.reduce((pre, cur) => pre + cur, a);
}

console.log(func(1, 2, 3));
```

剩余参数必须是最后一个参数，并且不允许在对象的``set``函数使用，因为``set``函数只能传递一个参数。

```js
function func(a, ...args, b) {
  console.log(args); 
}

console.log(func(1, 2, 3));  // Rest parameter must be last formal parameter
```

## 展开运算符

如果我们需要把一个数组每个元素作为函数调用的参数，在es5中可以用``apply``方式调用：

```js
const arr = [1, 2, 3];

console.log(Math.max.apply(Math, arr)); // 3
```

在es6中利用开展运算符可以更方便调用。展开运算符用``...``符号对一个数组拆散，作为函数的参数：

```js
const arr = [1, 2, 3];

// 可以在其他参数共用
console.log(Math.max(...arr, 0)); // 3
```

## 箭头函数

在es6引入的一种新的定义函数的方式，基本用法：

```js
// 无参数
const func = () => {};

// 单个参数省略括号
const funcA = a => a;

// 多个参数
const funcB = (a, b) => a + b;

// 多条语句用{}包括函数体
const funcC = (a, b) => {
  b++;
  return a + b;
};

// 返回对象
const funcD = () => ({ a: 1 });
```

**没有this绑定**。在箭头函数中无this对象，它的值为最近一个不是箭头函数的this。

```js
let obj = {
  name: 'wozien',

  show: function() {
    return () => {
      // 这里的this就是调用show函数的this
      console.log(this.name);
    };
  }
};

obj.show()();
```

**不能作为new调用**。 箭头函数没有函数内部属性``[[Constructor]]``，所以无法作为构造函数。

```js
const Person = name => {
  this.name = name;
};

new Person('wozien');  // TypeError: Person is not a constructor
```

**没有arguments参数**。取值和this类似：

```js
function func(a) {
  return () => {
    console.log(arguments[0]);
  };
}

func(1)();  // 1
```

**无法通过call和apply改变this指向**，但是可以执行函数。

```js
let obj = {
  name: 'wozien'
};

const show = () => {
  console.log(this.name);
};

show.call(obj);  // undefined
```

总而言之，箭头函数只是当作是普通函数一种简写方式，在大部分场景都适用，比如在一个对象内绑定回调函数，而且回调函数用到该对象的属性等，这是回调函数就可以用箭头函数定义。

我们不建议箭头函数作为对象方法的定义，因为这违背了我们在方法中使用对象属性的初衷。

```js
let obj = {
  name: 'wozien',

  show: () => {
    console.log(this.name);
  }
};

obj.show();  // undefined
```

## 参考

[https://github.com/mqyqingfeng/Blog/issues/85](https://github.com/mqyqingfeng/Blog/issues/85)