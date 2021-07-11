# Promise与异步编程

``Promise`` 是 es6 引入的异步处理方案，让我们可以采用链式的写法注册回调函数，摆脱多层异步回调函数嵌套的情况，使代码更加简洁。

<!--more-->

## 基本用法

用``new Promise()`` 创建一个 ``Promise`` 对象:

```js
let p = new Promise((resolve, reject) => {
  //
})
```

``Promise`` 对象有3种状态:

- ``pending``: 表示进行中的状态
- ``fulfilled``: 任务完成的状态，调用``resolve()``后触发
- ``rejected``: 任务失败的状态， 调用``rejected()``后触发

状态只能从 ``pending``到 ``fulfilled``，或者 ``peding`` 到 ``rejected``。并且状态一旦发生改变，将不会恢复。

``Promise``对象的 ``then()`` 方法，第一个参数为状态变成``fulfilled``的处理函数，第二个为 ``rejected`` 的处理函数。处理函数的参数通过 ``resolve()``方法或者 ``reject()``方法的参数传递：

```js
let p = new Promise((resolve, reject) => {
  // 修改promise对象的状态为fulfilled
  resolve(1);
});

p.then(v => {
  console.log(v);   // 1
});
```

``catch()`` 方法同样可以捕获失败状态的 ``Promise`` 对象，所以下面两种写法等价：

```js
let p = new Promise((resolve, reject) => {
  // 修改promise对象的状态为rejected
  reject(new Error('boom'));
});

p.then(null, err => {
  console.log(err.message);  // boom
});

// 等价于

p.catch(err => {
  console.log(err.message); // boom
});
```

在``Promise`` 初始化函数中抛出错误也是变成 ``rejected`` 状态：

```js
let p = new Promise((resolve, reject) => {
  throw new Error('boom');
});

p.catch(err => {
  console.log(err.message); // boom
});

```

对于未处理的错误，``catch()`` 总是能捕捉到。比如上面可以改写成：

```js
let p = new Promise((resolve, reject) => {
  throw new Error('boom');
});

p.then(null).catch(err => {
  console.log(err.message); // boom
});
```

## 立即完成的Promise

``Promise.resolve()`` 方法只接收一个参数并返回一个完成态的 ``Promise``：

```js

let p = Promise.resolve(1);
p.then(v => console.log(v)); // 1

// 等价于
let p = new Promise((resolve, reject) => {
  resolve(1)
})
```

如果方法传入的是一个非Promise的 ``thenable`` 对象，指的是拥有 ``then()``方法并接收 ``resolve`` 和 ``reject`` 两个参数的普通对象。结果会返回一个新的``Promise``，并且执行``thenable`` 中的``then``方法：

```js
let thenable = {
  then(resolve, reject) {
    resolve(44);
  }
};

let p = Promise.resolve(thenable);

p.then(v => console.log(v)); // 44
```

如果传入的是一个``Promise`` 对象，会原封不动的返回这个对象。

另外，通过 ``Promise.resolve()`` 创建的对象的 ``then()`` 方法执行是在本次事件循环：

```js
setTimeout(() => {
  console.log('next event loop');
}， 0);

let p = Promise.resolve('current event loop');

p.then(v => console.log(v));

// current event loop
// next event loop
```

利用 ``Promise.reject()``可以创建立即失败的``Promise``，参数用法和上面类似。

## 串行的Promise

其实每次调用``then()`` 和 ``catch()`` 方法都会返回一个``Promise``对象，因此我们可以链式的调用:

```js
let p = Promise.resolve(42);

p.then(v => console.log(v)).then(() => console.log('finish'));  // 42 finish
```

在 ``then()`` 或者 ``catch()`` 方法中抛出错误，会被下一个``catch()``方法捕获。所以我们推荐在链式的Promise最后一个为 ``catch()``:

```js
let p = Promise.resolve(42);

p.then(v => {
  console.log(v);   // 42
  throw new Error('boom');
}).catch(e => {
  console.log(e.message);  // boom
});
```

在``then()`` 方法中可以return一个值，相当于该值会先作为 ``Promise.resolve()`` 参数调用，然后返回一个 ``Promise`` 对象，后续的方法调用取决与这个 ``Promise`` 的状态：

```js
let p = Promise.resolve(42);

p.then(v => {
  console.log(v);
  return v + 1; // 相当于 Promise.resolve(v+1);
})
  .then(v => {
    console.log(v);
  })

// 42
// 43
```

返回一个 ``thenable`` 对象：

```js
let p = Promise.resolve(42);
let thenable = {
  then(resolve, reject) {
    reject(44);
  }
};

p.then(v => {
  console.log(v);
  return thenable; // 相当于 Promise.resolve(thenable);
})
  .then(v => {
    console.log(v);
  })
  .catch(v => {
    console.log('error: ' + v);
  });

// 42
// error: 44
```

## 响应多个Promise

``Promise.all()`` 方法接收一个参数并返回一个 ``Promise``，该参数是含有多个``Promise`` 对象的可迭代元素，例如数组。当每个 ``Promise``对象的状态都为``fulfilled`` 时，返回的 ``Promise`` 状态才是 ``fulfilled``:

```js
let p1 = Promise.resolve(1);
let p2 = new Promise((resolve, reject) => {
  resolve(2);
});
let p3 = new Promise((resolve, reject) => {
  resolve(3);
});

let p = Promise.all([p1, p2, p3]);
p.then(v => console.log(v));  // [ 1, 2, 3 ]
```

只要其中有一个``Promise``状态为 ``rejected``，最后的返回 ``Promise``的状态就为 ``rejected``：

```js
let p1 = Promise.resolve(1);
let p2 = new Promise((resolve, reject) => {
  reject(new Error('boom'));
});
let p3 = new Promise((resolve, reject) => {
  resolve(3);
});

let p = Promise.all([p1, p2, p3]);
p.then(v => console.log(v)).catch(e => console.log(e.message)); // 'boom'
```

``Promise.race()``方法接收的参数和 ``all()``一样，不同的是，传给 ``race()``方法的 ``Promise`` 对象只要有一个状态发生改变，返回的 ``Promise`` 的状态就会改变，无需等其他的 ``Promise`` 状态都改变：

```js
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 0);
});

let p2 = Promise.resolve(2);
let p3 = new Promise((resolve, reject) => {
  reject(3);
});

let p = Promise.race([p1, p2, p3]);
p.then(v => console.log(v)).catch(e => console.log(e.message)); // 2
```

## 异步处理应用

在之前我们有一个模拟的异步任务：

```js
function fetchData(url, cb) {
  setTimeout(() => {
    cb({ code: 0, data: url });
  }, 1000);
}

fetchData('aa.com', res => console.log(res.data));  // aa.com
```

我们可以利用 ``Promise`` 的方式改写这个异步任务：

```js
function fetchData(url) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 0, data: url });
    }, 1000);
  });
}


fetchData('aa.com').then(res => console.log(res.data)); // aa.com
```

对于自动执行函数run()我们可以改写成支持 ``Promise`` 异步的形式：

```js
function run(gen) {
  let g = gen();

  function next(data) {
    let result = g.next(data);

    if (result.done) return;

    let p = Promise.resolve(result.value);
    p.then(value => {
      next(value);
    }).catch(err => {
      g.throw(err);
    });
  }

  next();
}
```

## 参考

[阮一峰es-promise](http://es6.ruanyifeng.com/#docs/promise#Promise-resolve)

[ES6 系列之我们来聊聊 Promise](https://github.com/mqyqingfeng/Blog/issues/98)