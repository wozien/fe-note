# Symbol类型

在es5中有五种基本类型分别是字符串，数字，布尔，``null`` 和 ``undefined``，在es6中引入一种新的基本类型 ``Symbol``，表示独一无二的值。常用于模拟创建对象的私有属性。

<!--more-->

## 基本用法

调用全局函数 ``Symbol`` 创建，该函数接收一个字符串作为描述参数：

```js
let sb = Symbol('sb');

console.log(sb); // Symbol(sb)
console.log(typeof sb); // symbol
```

不能使用 ``new`` 调用，因为 ``Symbol`` 是基本类型，不是返回对象。

因为 ``Symbol`` 本身表示独一无二的值，所以两个相同描述的 ``Symbol`` 是不相等的：

```js
let sb = Symbol('sb');
let sb2 = Symbol('sb');

console.log(sb === sb2); // false
```

对象作为描述会先调用对象的 ``toString`` 方法：

```js
let obj = {
  toString() {
    return 'Symbol obj';
  }
};

let sb = Symbol(obj);

console.log(sb); // Symbol(Symbol obj)
```

不能通过运算强制转换为字符串和数字：

```js
let sb = Symbol('sb');
let desc = sb + ''; // Cannot convert a Symbol value to a string
let num = sb + 1; // Cannot convert a Symbol value to a number
```

## Symbol相关方法

有时候我们需要用到同一个 ``Symbol`` 来做一些处理，就要用到 ``Symbol.for`` 方法来注册一个全局的 ``Symbol``：

```js
let sb = Symbol.for('sb');
let sb2 = Symbol.for('sb');
let obj = {
  [sb]: '12345'
};

console.log(obj[sb]);  // 12345
console.log(sb === sb2); // true
console.log(obj[sb2]); // 12345
```

调用该方法会先在全局的Symbol注册表中查找有没有键为'sb'的 ``Symbol``，如果存在则返回。不存在就先创建一个新的 ``Symbol`` ，并在全局表中注册。

``Symbol.keyFor`` 方法返回在Symbol全局注册表中检索与该 ``Symbol`` 有关的key：

```js
let sb = Symbol.for('sb');

console.log(Symbol.keyFor(sb)); // sb

let sb2 = Symbol('sb');

console.log(Symbol.keyFor(sb2));  // undefined
```

用 ``Symbol`` 作为对象的属性无法在 ``Object.keys`` 和``Object.getOwnPropertyNames`` 方法返回，es6提供一个``Object.getOwnPropertySymbols`` 方法来返回对象所有的 ``Symbol`` 属性。

```js
let sb = Symbol('sb');
let obj = {
  [sb]: '12345'
};

let symbols = Object.getOwnPropertySymbols(obj);

console.log(symbols);   // [ Symbol(sb) ]
console.log(obj[symbols[0]]);  // 12345
```

## well-know Symbol

es6提供了一些内置的 ``Symbol`` 变量，用于改变js中某些行为。比如设置构造函数的``Symbol.hasInstance`` 可以自定义 ``instanceof`` 的行为：

```js
function SpecialNumber() {
  //
}

Object.defineProperty(SpecialNumber, Symbol.hasInstance, {
  value: function(v) {
    return v instanceof Number && (v >= 1 && v <= 100);
  }
});

let zero = new Number(0),
  two = new Number(2);

console.log(zero instanceof SpecialNumber); // false
console.log(two instanceof SpecialNumber); // true
```

``Symbol.toStringTag`` 可以改变调用 ``Object.prototype.toString`` 方法的默认行为:

```js
function Person(name) {
  this.name = name;
}

Person.prototype[Symbol.toStringTag] = 'Person';

Person.prototype.toString = function() {
  return this.name;
};

const person = new Person('wozien');

console.log(Object.prototype.toString.call(person)); // [object Person]
console.log(person.toString());  // wozien
```

其他内置的Symbol及用法参考[MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols)

## 应用场景

**作为对象的属性和方法**，模拟对象的私有化：

```js
let myKey = Symbol();
let myFunc = Symbol();
let obj = {
  [myKey]: '123',
  [myFunc]() {
    return 'bar';
  }
};
console.log(obj[myKey]);  // 123
console.log(obj[myFunc]()); // bar
```

**定义常量**，防止常量重复定义：

```js
const COLOR_RED = Symbol('red');
const COLOR_BLUR = Symbol('blue');
const COLOR_PINK = Symbol('pink');

switch (color) {
  case COLOR_RED:
    break;
  case COLOR_BLUR:
    break;
  //
}
```

** 作为类型的私有属性 ** 。防止定义的冲突和外部访问：

```js
const PASSWORD = Symbol();
class Login {
    constructor(name, password) {
        this.name = name;
        this[PASSWORD] = password;
    }
    hasPassword(pw) {
        return this[PASSWORD] === pw;
    }
}
```

** 自定义对象的迭代行为 ** ：

```js
let obj = {
  data: ['hello', 'world'],
  [Symbol.iterator]() {
    const self = this;
    let index = 0;
    return {
      next() {
        if (index < self.data.length) {
          return {
            value: self.data[index++]
          };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (let x of obj) {
  console.log(x);
}

// hello
// world
```

## 参考

[Symbol-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

[symbol的用法和场景](https://2ality.com/2014/12/es6-symbols.html)

[>>>原文地址](https://www.inoob.xyz/posts/140bf504/)