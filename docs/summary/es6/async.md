# async函数

在es6中引入了``Promise`` 和 ``Generator`` 函数的概念方便我们更加快速优化的实现异步编程，但是生成器的运行依赖于自动执行函数或者``co``模块。所以在es7引入了 ``async`` 函数，使异步操作更加方便。

<!--more-->

## 基本用法

我们可以把 ``async`` 函数看作是自动执行 ``Generator`` 函数的语法糖：

```js
async function fn(args) {

}
// 等价于
function fn(args) {
  return run(function*() {
  
  });
}
```

我们只要在普通函数前面加上 ``async`` 关键字，在函数体里面把 ``yield`` 替换成``await``。按正常函数调用方式即可执行按顺序执行异步任务。所以之前的gen()异步任务可以改写成：

```js
function fetchData(url) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ code: 0, data: url });
    }, 1000);
  });
}

async function gen() {
  let res1 = await fetchData('http://www.baidu.com');
  let res2 = await fetchData('http://www.inoob.xyz');
  return res1.data + ' ' + res2.data;
}

gen().then(data => console.log(data));

```

由上面的代码可见，``async`` 函数返回一个 ``Promise``。函数内部的return值成为``then()`` 成功处理函数的参数。

``await`` 后面如果是一个 ``Promise`` 对象，会返回对象的 ``resolve()`` 或者``reject()`` 的结果。否则直接返回结果：

```js
async function fn() {
  let a = await Promise.resolve(1);
  let b = await 2;
  return a + b;
}

fn().then(v => console.log(v));   // 3
```

在 ``async`` 函数抛出错误，会被返回的 ``Promise`` 的 ``catch()`` 方法捕捉：

```js
async function fn() {
  await Promise.resolve(1);
  throw new Error('boom');
}

fn()
  .then(v => console.log(v))
  .catch(e => console.log(e.message)); // boom

```

另外 ``await`` 后面的 ``resolve()`` 的返回值必须 ``return`` 才能被 ``then()`` 获取，而 ``reject()`` 则不用。并且 ``reject()`` 后，函数将会中断执行：

```js
async function fn() {
  await Promise.reject(1);
  throw new Error('boom'); // 不会执行
}

fn()
  .then(null, v => console.log(v)) // 1
  .catch(e => console.log(e.message)); 
```

## 错误处理

因为``await`` 后面的 ``Promise`` 状态失败会导致整个函数中断，于是可以在``try...catch`` 中捕获：

```js
async function fn() {
  try {
    await Promise.reject(new Error('boom'));
  } catch (e) {
    //
  }
  return await Promise.resolve(1);
}

fn()
  .then(v => console.log(v))  // 1
  .catch(e => console.log(e.message));
```

另一种方式是在 ``await`` 后面的 ``Promise`` 对象的后面再跟上一个 ``catch()`` 方法:

```js
async function fn() {
  await Promise.reject(new Error('boom')).catch(e => {});
  return await Promise.resolve(1);
}

fn()
  .then(v => console.log(v)) // 1
  .catch(e => console.log(e.message));
```

## 并发执行

``await`` 后面的异步任务如果没有先后顺序，最好让他们并发执行：

```js
async function fn() {
  let res1 = await getName();
  let res2 = await getMaxListeners();
  return [res1.data, res2.data];
}
```

应该写成下面方式：

```js
async function fn() {
  let p1 = getName();
  let p2 = getMaxListeners();
  let res1 = await p1;
  let res2 = await p2;
  return [res1.data, res2.data];
}
```

或者利用 ``Promise.all()`` 的方式：

```js
async function fn() {
  let p1 = getName();
  let p2 = getMaxListeners();
  let [res1, res2] = await Promise.all([p1, p2]);
  return [res1.data, res2.data];
}
```

## 异步处理比较

对于 ``Promise`` 和 ``async`` 两者其实没有什么可比性，后者其实是需要依赖前者。只是有了 ``async`` 让异步编码更加优雅：

```js
function fetch() {
  return fetchData()
  .then(data => {
    if (data.moreData) {
        return fetchAnotherData(data)
        .then(moreData => {
          return moreData
        })
    } else {
      return data
    }
  });
}

// 用async改写
async function fetch() {
  const data = await fetchData()
  if (data.moreData) {
    const moreData = await fetchAnotherData(data);
    return moreData
  } else {
    return data
  }
};
```

对于和 ``Generator`` 比较，我认为在异步处理方面是可以取代它的，毕竟方便更多。但是``Generator`` 还有其他方面的应用，比如更加方便的实现迭代器。

## 参考

[ES6 系列之我们来聊聊 Async](https://github.com/mqyqingfeng/Blog/issues/100)