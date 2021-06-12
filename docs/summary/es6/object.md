# 对象扩展

在es6中通过多种方式来加强对象的使用，通过简单的语法扩展，来提供更多操作对象及与对象交互的方法。

<!--more-->


## 字面量语法扩展

当对象属性名和变量名相同时，赋值的时候可以省略变量名:

```js
function getObj(name, age) {
  return {
    name,
    age
  }
}
```

对象方法定义的简写。省略 ``function`` 关键字和冒号：

```js
var person = {
  name: 'wozien',
  sayName() {
    console.log(this.name);
  }
};

console.log(person.name); // wozien
```

在es5中,如果想要通过计算得到属性名，只能通过对象加方括号的方式在定义变量属性，不能用点：

```js
const lastName = 'last name';
const person = {
  'first name': 'wozien'
};
person[lastName] = 'zhang';
```

在es6中，允许在对象字面量时用方括号来定义可计算的属性，扩展内允许任意的js表达式：

```js
const lastName = 'last';
const person = {
  'first name': 'wozien',
  [lastName + ' name']: 'zhang'
};

console.log(person);
```

## 新增对象方法

利用 ``Object.is`` 判断两个值是否全相等：

```js
console.log(Object.is(5, '5')); // false
console.log(Object.is(5, 5));  // true
```

该方法基本和全等 ``===`` 相同，但是判断正负0和``NaN``有所区别：

```js
console.log(+0 === -0); // true
console.log(Object.is(+0, -0)); // false

console.log(NaN === NaN);  // false
console.log(Object.is(NaN, NaN));  // true
```

利用 ``Object.assign`` 合并对象：

```js
const receiver = {};

Object.assign(
  receiver,
  {
    type: 'js',
    name: 'file.js'
  },
  {
    type: 'css'
  }
);

console.log(receiver); // { type: 'css', name: 'file.js' }
```

该方法会合并后面的对象到第一个对象，重复的属性值以最后一个对象为准。该方法为浅拷贝，如果属性值为对象，拷贝的是对象的引用。

## 增量对象的原型

利用``Object.setPrototype()`` 方法修改对象的原型：

```js
let person = {
  say() {
    console.log('person');
  }
};

let dog = {
  say() {
    console.log('dog');
  }
};

let friend = Object.create(person);
console.log(friend.say()); // person
Object.setPrototypeOf(friend, dog);
console.log(friend.say());  // dog
```

利用 ``super`` 调用原型对象方法：

```js
let person = {
  name: 'person',
  say() {
    console.log(this.name);
  }
};

let friend = {
  name: 'friend',
  say() {
    super.say();
  }
};

Object.setPrototypeOf(friend, person);
console.log(friend.say()); // friend
```

上面friend对象的原型设置为person，在friend的say方法中利用 ``super.say`` 调用了person的say方法。但是输出的结果却不是'person'。这是利用 ``super`` 调用原型方法的时候，会把方法的 ``this`` 对象指向``super`` 调用环境的 ``this`` 对象。上面代码相当于:

```js

// ...
let friend = {
  name: 'friend',
  say() {
    Object.getPrototypeOf(friend).say.call(this);
  }
};
```