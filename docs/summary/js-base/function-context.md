# 函数执行上下文

执行上下文(也称执行环境)是JS一个重要的概念，它定义了变量或者函数有权访问的其他数据。其中变量对象是上下文中一个重要的概念，它就好比存储了改上下文变量和函数的容器。


## 一个例子

JS的代码并不是一行一行执行的，而是一段一段的解析执行的。这里的一段就是指执行上下文。

```js
a = 2;

foo(); // 2

var a;

function foo() {
  console.log(a);
}
```

在JS中分成两种执行环境，分别为全局环境和函数环境。全局环境在浏览器就是脚本的最外层。

```html
<script>
//  全局上下文
  
var a = 1;
    
function fun() {
  // 函数上下文 
}  
</script>
```

JS代码的执行上下文的执行顺序用一个栈来维护，叫做执行上下文栈。脚本一开始执行就把全局上下压进栈里，当执行一个函数时，就会创建一个函数上下文进栈。当函数执行完时就会出栈。全局环境永远在栈底，直到程序退出后才出栈。

```js
function foo() {
  bar();
}

function bar() {
  //
}

foo();
```

上面代码的执行上下文栈的变化如下：

```js
ECStack.push(globalContext)
ECStack.push(foo)
ECStack.push(bar)
ECStack.pop()
ECStack.pop()
```

## 变量对象

每个执行环境都有一个存储变量和函数的对象，称为变量对象(VO)。全局环境的这个对象我们一般认为是``window``, 所以我们在全局环境声明的变量或函数都会成为``window``对象的属性：

```js
var a = 1;

function foo() {}

console.log(a === window.a); // true
console.log(foo === window.foo); // true
```

每个函数的执行环境也有一个变量对象，可以存储函数参数，变量和函数，但是变量对象我们无法访问。只有当函数被执行的时候，变量对象会用``arguments``初始化并激活，这是可以称为活动对象(AO), 并且可以访问定义的变量。因此变量对象和活动对象其实是一个东西。

函数的执行分为两个阶段：

- 进入阶段：

 - 函数参数会作为活动对象的属性，值为参数的传值，没有则为``undefined``
 - 声明的函数会作为对象的属性，值为函数的引用。函数声明会存在同名覆盖
 - 声明的变量会作为对象的属性，值为``undefined``。不会影响到同名变量的形参

- 执行阶段: 变量的值求赋值AO相应的属性

如下面的例子：

```js
function foo(a) {
  var b = 2;
  function c() {}
  var d = function() {};

  b = 3;

}

foo(1);
```

在进入阶段对象的AO为：

```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: undefined,
    c: reference to function c(){},
    d: undefined
}
```

在执行阶段b和d会被赋值：

```js
AO = {
    arguments: {
        0: 1,
        length: 1
    },
    a: 1,
    b: 3,
    c: reference to function c(){},
    d: reference to FunctionExpression "d"
}
```

## 变量提升

知道了JS的执行上下文从创建到执行的变化就不难解析变量提升的机制了，比如上面的例子中：

```js
a = 2;

foo(); // 2

function foo() {
  console.log(a);
}

var a;
```

当执行这段代码的进入阶段，变量对象会激活为活动对象，处理变量和函数的声明：

```js
AO = {
  a: undefined,
  foo: reference to function foo(){ 
}
```

到了执行阶段，当遇到a=2时，会为活动对象的属性赋值。这时候a已经定义在对象上，所以不会报未声明的错误。最后活动对象就变成了：

```js
AO = {
  a: 2,
  foo: reference to function foo(){ 
}
```

上面的代码看起来像变量的声明被提升到执行环境的最顶部，但是这仅限于用``var``声明的变量。比如es6中的 ``let`` 和 ``const`` 就不存在这种机制。

## 思考题

下面的代码的执行过程有啥区别：

```js
// 1
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();

// 2

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

上面两段代码执行结果一样，但是执行过程的上下文栈变化不一样。第一段的栈变化如下：

```js
ECStack.push(checkscope)
ECStack.push(f)
ECStack.pop()
ECStack.pop()
```

而第二段的变化如下：

```js
ECStack.push(checkscope)
ECStack.pop()
ECStack.push(f)
ECStack.pop()
```

## 参考

[JavaScript深入之执行上下文栈](https://github.com/mqyqingfeng/Blog/issues/4)