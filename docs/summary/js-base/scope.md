# 作用域

作用域是定义一个变量可访问区域。JS中在一个上下文的访问一个变量，会按照某种规则查找这个变量，这个规则我们成为作用域链。

## 词法作用域

词法作用域(也称静态作用域)是指上下文中访问一个变量的查找顺序在它环境定义时就决定，与何时进入执行环境无关。比如下面的例子

```js
var str = 'global';
function foo() {
  console.log(str);
}

function run() {
  var str = 'run';
  foo();  // global
}

run();
```

上面例子输出的结果是global而不是run。这就说明的foo()函数在查找str变量时候是根据函数定义时决定的，和函数的执行无关。

和静态作用域相对的是动态作用域，比如Perl语言.

## 作用域链

函数执行时查找一个变量的值，会现在当前执行环境查找时候定义。如果没有定义，会去它的父执行上下文查找，向上查找直到全局环境。如果全局环境也找不到就会报错。这种定义一个变量的查询顺序的规则就叫作用域链。

```js
var a = 1;

function foo() {
  var b = 2;

  function bar() {
    var c = a + b;
    console.log(c); // 3
    console.log(d);  // Uncaught ReferenceError: b is not defined
  }
  bar();
}

foo();
```

我们知道函数声明时会创建变量对象(VO)，在函数执行时该对象激活变成活动对象(AO)。与此同时，函数创建时也会决定它的内部属性[[Scopes]]，值为声明它的上下文的[[Scopes]]。当函数执行的时候会把当前的执行上下文的活动对象压进[[Scopes]]的顶部。当查找一个变量时就会遍历[[Scopes]]的变量对象，这就是作用域链的内部机制。

## 延长作用域链

在JS中创建一个函数才会对应的变量对象和作用域链，当在函数里面用with语句的时候，会把当前作用的对象加到函数作用域链的顶部，从而延长了作用域链：

```js
var obj = {
  a: 1
};

function foo() {
  with (obj) {
    console.log(a);   // 1
    var str = 'hello';
  }
  console.log(str);  // hello
}

foo();
```

上面的代码看出，with里面声明的变量会加到最近的执行环境上。另外的try...catch语句的catch块也可以实现作用域链的延长。

## 欺骗词法作用域

我们知道一个变量的访问规则是在函数书写就决定的，但是eval()函数插入的代码会破坏这一规则：

```js
var a = 1;

function foo() {
  eval('a=2');
  console.log(a); // 2
}

foo();
```

上面代码的函数的创建不会知道eval()里面的字符串代码，只是在执行的时候按照正常作用域链的查找顺序，根据就近原则，优先找到了a=2。

## 参考

[JavaScript深入之作用域链](https://github.com/mqyqingfeng/Blog/issues/6)