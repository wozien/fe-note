# let 和 const 

我们知道es5中 ``var`` 声明变量是作用于在全局或函数作用域，并且全局声明的变量还会作为 ``window`` 对象的属性。这样会增加程序错误的产生和不可控。

## 变量提升

在全局或者函数作用内用 ``var`` 声明的变量，在js预编译阶段会提升到当前作用域的顶部，这就是变量提升。如下代码：

```js
function getValue(condition) {
  if (condition) {
    var value = 'red';
  } else {
    console.log(value); // undefined
  }
  console.log(value);  // undefined
}
```

以上代码相当于把变量value放在当前作用域先声明，所以才能在if块外和else块访问到，都会输出 ``undefined``。

```js
function getValue(condition) {
  var value;
  if (condition) {
    value = 'red';
  } else {
    console.log(value); // undefined
  }
  console.log(value);  // undefined
}
```

## let声明

从上面的可以看出 ``var`` 声明的变量没有块级作用域的概念，所以es6引入了``let`` 声明，并绑定在当前的块作用域，块作用域外访问报错，如下：

```js
function getValue(condition) {
  if (condition) {
    let value = 'red';
  } else {
    console.log(value); // ReferenceError: value is not defined
  }
  console.log(value); // ReferenceError: value is not defined
}
```

禁止重复声明。在同一个块中不能用 ``let`` 声明已经存在的标识符，否则会报错。如果是嵌套的作用域中重复声明，则不会报错。

```js
var count = 30;
let count = 30;  // SyntaxError: Identifier 'count' has already been declared

if (true) {
  let count = 30;  // 不会报错
}
```

## const声明

在es6引入``const`` 来进行常量的声明。他和前面的 ``let`` 一样有块作用域绑定和不许重复声明的特性。但是``const`` 必须要在声明的阶段进行初始化，而``let`` 不用。

```js
let count;   // 不会报错

const count;  //SyntaxError: Missing initializer in const declaration

const count = 30;  // 正确声明
```

``const`` 声明的变量不能再赋值。如果变量是引用类型，可以修改对象的属性值，但不可以重新修改绑定的对象。

```js
const count = 20;
count = 30;  // TypeError: Assignment to constant variable.

const obj = {};
obj.name = 'wozien';
```

## 临时死区

由于``let`` 与 ``const`` 不存在变量提升，所以在声明前使用该变量会报错。因为在声明前，该变量存在于所谓的临时死区(TDZ)。

```js
if (true) {
  console.log(typeof value);
  let value = 'red'; // ReferenceError: value is not defined
}
```

当变量声明后，就会从临时死区移出，后续可正常访问。注意的是，TDZ是针对当前的块作用域而言，所以如下可以正确运行：

```js
console.log(typeof value); // undefiend
if (true) {
  let value = 'red';
}
```

## 在循环中的区别

在 ``var`` 声明的循环变量，会在循环后外部可正常访问，并且值为跳出循环的值。``let`` 声明的变量则只在循环体内有效，如下：

```js
for (var i = 0; i < 5; i++) {}
console.log(i); // 5

for (let i = 0; i < 5; i++) {}
console.log(i); // ReferenceError: i is not defined
```

在利用 ``var`` 声明的循环中创建函数会变得很艰难，因为函数执行的时候是迭代完的最终，如下：

```js
const func = [];
for (var i = 0; i < 3; i++) {
  func.push(() => {
    console.log(i);
  });
}
func.forEach(func => func()); // 2 2 2
```

我们可以利用立即执行函数(IIFE)解决这个问题，让每个函数最终保存的是迭代过程中变量的副本。

```js
for (var i = 0; i < 3; i++) {
  (function(value) {
    func.push(() => console.log(value));
  })(i);
}
```

在es6中循环里面 ``let`` 声明可以用来简化上面IIFE的实现过程，他会在每次迭代过程中重新声明一个同名变量i，值为当前的迭代i的值，所以循环体内的函数使用的都是i值的副本。

```js
for (let i = 0; i < 3; i++) {
  func.push(() => console.log(i));
}
func.forEach(func => func()); // 0 1 2
```

如果把 ``let`` 改成 ``const``, 在第二次迭代的时候会报错，因为 ``const`` 不许重新赋值。而对于 ``for-in`` 和 ``for-of`` 循环两者都可以正常的运行。

```js
const obj = {
  a: 1,
  b: 2,
  c: 3
};
const func = [];

for (let key in obj) {
  func.push(() => console.log(key));
}

func.forEach(func => func());  // a b c
```

如果把``let`` 替换成 ``var`` ，将会输出3个c。因为 ``for-in`` 和 ``for-of`` 每次都只会重新声明一个新的副本key。

## 在全局中的绑定

利用 ``var`` 在全局声明变量，会作为window对象的一个属性存在，而 ``let`` 和 ``const`` 则不会。

```js
var a = 1;
let b = 2;
const c = 3;

console.log(window.a); // 1
console.log(window.b); // undefined
console.log(window.c); // undefined
```

## 小结

es6中的``let`` 和 ``const`` 与 ``var`` 区别如下：

- 绑定块作用域，不存在变量提升
- 不允许重复定义
- 声明前不允许使用变量
- ``for`` 循环中每次创建新的副本
- 全局声明不作为 ``window`` 属性

在我们平时的开发中，可以默认使用``const``。在确认需要改变变量的值时才使用``let``，可以一定程序上防止代码的错误产生。