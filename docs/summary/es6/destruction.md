# 对象和数组的结构

我们经常需要在对象和数组内提取相关的数据，往往我们需要遍历才能完成。而在es6添加了简化这种任务的新特性：解构。解构是一种打破数据解构，将其拆分成更小部分的过程。

<!--more--> 

## 对象解构

基本用法:

```js
let node = {
  type: 'Identifier',
  name: 'foo'
};

let { type, name } = node;

console.log(type, name); // Identifier foo
```

另外，解构必须提供初始值。即等号右边不能为``null``，``undefiend`` 或者不提供：

```js
let { type, name };  // Missing initializer in destructuring declaration
let { type } = null;  // undefiend也是不行
```

对已经声明的变量也可以使用解构，但是这时候解构语句要用一对括号包含起来，因为js引擎会把花括号当作语法块处理：

```js
let node = {
  type: 'Identifier',
  name: 'foo'
};
let type = 'Listers',
  name = 5;

  // 用圆括号包含
({ type, name } = node);

console.log(type, name); // Identifier foo
```

解构的变量名称如果不在对象中会被赋值为 ``undefiend``，我们可以为解构的变量提供一个默认值，在属性名后面添加等号和默认值即可：

```js
let node = {
  type: 'Identifier'
};

let { type, name = 'wozien' } = node;

console.log(type, name); // Identifier wozien
```

当我们需要解构的变量名和对象属性名不同，可以在解构的属性名后面添加冒号和对应的变量名：

```js
let node = {
  type: 'Identifier',
  name: 'foo'
};

let { type: myType, name: myName = 'wozien' } = node;

console.log(myType, myName); // Identifier foo
```

可见，解构表达式冒号左边指的是对象需要解构的属性位置，冒号右边才是需要绑定的变量。所以同名的解构是下面方式的简写：

```js
let {
  type: type,
  name: name
} = node;
```

嵌套对象的解构和字面量写法一样，只要提供更深的花括号即可：

```js
let node = {
  type: 'Identifier',
  name: 'foo',
  loc: {
    start: {
      line: 1,
      column: 1
    },
    end: {
      line: 1,
      column: 4
    }
  }
};

let { loc: { start } } = node;

console.log(start.line); // 1
```

## 数组解构

基本用法：

```js
let colors = ['red', 'green', 'blue'];
let [firstColor, secondColor] = colors;
console.log(firstColor, secondColor); // red green
```

如果我们只想获取固定位置的元素，可以这样：

```js
let colors = ['red', 'green', 'blue'];
let [, , thirdColor] = colors;
console.log(thirdColor); // blue
```

解构赋值给已经声明的变量不需要用圆括号，这和对象解构赋值有区别：

```js
let colors = ['red', 'green', 'blue'];
let firstColor = 'yellow';

// 不需要括号
[firstColor] = colors;
console.log(firstColor); // red
```

数组解构也可以使用默认值，当指定位置元素不存在或者为 ``undefined`` 时使用：

```js
let colors = ['red'];
let [firstColor, secondColor = 'green'] = colors;
console.log(firstColor, secondColor); //red green
```

嵌套数组解构和对象类似，提供更深的方括号即可：

```js
let colors = ['red', ['green', 'blue']];
let [firstColor, [secondColor]] = colors;
console.log(firstColor, secondColor); //red green
```

不定参数解构。利用``...`` 可以把数组剩余的数据赋值给一个指定的变量：

```js
let colors = ['red', 'green', 'blue'];
let [firstColor, ...secondColor] = colors;
console.log(firstColor); //red 
console.log(secondColor); // [ 'green', 'blue' ]
```

混合解构，方便我们提取对象和数组结合的数据：

```js
let node = {
  type: 'Identifier',
  name: 'foo',
  loc: {
    start: {
      line: 1,
      column: 1
    },
    end: {
      line: 1,
      column: 4
    }
  },
  range: [0, 3]
};

let {
  loc: { end },
  range: [, startIndex]
} = node;

console.log(end.column); // 4
console.log(startIndex); // 3
```

## 应用场景

**函数参数的解构**。我们可以为接收一个对象或者数组的函数参数进行解构，这样就不需要在函数体里面进行对应属性的提取，并且可以更加直观的看出对象的传递属性：

```js
function setCookie(name, value, { path, domain, expire }) {
  // 设置cookie
  console.log(path, domain);
}

setCookie('a', 'b', { path: '/', domain: 'localhost' });
```

解构函数参数必须传递参数，不然会抛出错误。这时我们可以利用函数参数默认值解决：

```js
function setCookie(name, value, { path, domain, expire } = {}) {
  // 设置cookie
  console.log(path, domain);
}

setCookie('a', 'b');
```

**交换两个变量的值**。

```js
let a = 1, b = 2;
[b, a] = [a, b];

console.log(a, b);  // 2 1
```

**克隆数组**

```js
let colors = ['red', 'green', 'blue'];

let cloneColors = colors.concat(); // es5

let [...cloneColors] = colors;  // es6
```

[>>>原文地址](https://www.inoob.xyz/posts/2eca66cf/)