# 手写实现 Promise

`Promise` 是 es6 引入的异步处理方案，让我们可以采用链式的写法注册回调函数，摆脱多层异步回调函数嵌套的情况，使代码更加简洁。而理解 `Promise` 内部实现原理也十分重要，我们可以从简单的模型开始，考虑不同的边界情况，一步一步的往最终结果实现。

## 一个简单的雏形

如下我们可以新建一个 `Promise` 对象, 然后马上执行成功的回调。

```js
var a = new Promise(function(resolve) {
    resolve(1);
})

a.then(x => console.log(x))
```

可以看出， `Promise` 是一个构造函数，接收一个函数参数，其中函数参数的参数 `resolve` 在 `Promise` 构造函数内部实现。构造函数有一个 `then` 的方法，注册成功的回调， 在调用 `resolve` 时执行。 因此可以得到如下一个简单的模型：

```js
function _Promise(fn) {
    var self = this;
    this.value = null;
    this.callbacks = [];

    this.then = function(onFulfilled) {
        // 注册一个成功的回调函数
        this.callbacks.push(onFulfilled);
    }

    function resolve(value) {
        self.value = value;
        // 让所有回调函数进入下一个事件循环执行
        setTimeout(function(){
            self.callbacks.forEach(function(callback) {
                callback(value);
            })
        },0);
    }

    fn(resolve)
}
```

构造函数里面的属性 `value` 表示成功的最终值， `callbacks` 表示通过 `then` 注册的成功回调方法，类型是一个数组是因为 `Promise` 对象支持注册多个成功回调函数。在 `resolve` 中加入 `setTimeout` 延时是让所有回调函数在下一轮事件循环中执行，从而保证所有在当前执行队列的回调函数注册成功。

## 引入状态

前面实现的雏形可以让当前执行队列的回调函数成功执行，但是在下一轮或者之后注册的回调函数将无效。比如：

```js
a.then(x => console.log(x))

setTimeout(function(){
    a.then(x => console.log(x+1))
}, 1000);
```

上面只会输出第一个回调结果。所以，我们需要引入一个状态属性 `state`, 表示 `Promise` 对象当前的状态。当状态为 `pending` 的时候，注册的回调函数才压进 `callbacks` 中。当调用 `resolve` 后状态变为已解决 `fulfilled`， 此时通过 `then` 注册的成功回调会马上执行。如下：

```js
function _Promise(fn) {
    var self = this;

    this.state = 'pending';
    this.value = null;
    this.callbacks = [];

    this.then = function(onFulfilled) {
        if(this.state === 'pending') {
            this.callbacks.push(onFulfilled);
        }else {
            onFulfilled(this.value);
        }       
    }

    function resolve(value) {
        self.state = 'fulfilled';
        self.value = value;
        // 让所有回调函数进入下一个事件循环执行
        setTimeout(function(){
            self.callbacks.forEach(function(callback) {
                callback(value);
            })
        },0);
    }

    fn(resolve)
}
```

## 链式调用

我们知道原生的 `Promise` 可以支持链式调用，如下：

```js
var a = new Promise(function(resolve) {
    resolve(1);
})

a.then(x => {
    console.log(x);
    return x+1;
}).then(x => console.log(x))
```

可以看出第一个 `Promise` 对象回调中返回的值会最为新对象回调的参数，相当于返回一个立即 `resovle`(前者返回值) 的新 `Promise` 对象, 所以上面会输出1和2。

现在，我们就可以把 `then` 函数修改成返回一个新的 `Promise` 对象， 并且和当前的 `Promise` 对象做关联。如下：

```js
function _Promise(fn) {
    var self = this;

    this.state = 'pending';
    this.value = null;
    this.callbacks = [];

    this.then = function(onFulfilled) {
        // 返回一个新的Promise对象
        return new _Promise(function(resolve) {
            handleCallback({
                onFulfilled: onFulfilled || null,
                resolve: resolve  // 让当前的promise对象和新的promise对象关联
            })
        })
    }

    function handleCallback(callback) {
        if(self.state === 'pending') {
            self.callbacks.push(callback);return;
        }

        var res = callback.onFulfilled(self.value);
        // 调用新的promise对象的resolve
        callback.resolve(res);
    }

    function resolve(value) {
        self.state = 'fulfilled';
        self.value = value;
        // 让所有回调函数进入下一个事件循环执行
        setTimeout(function(){
            self.callbacks.forEach(function(callback) {
                handleCallback(callback);
            })
        },0);
    }

    fn(resolve)
}
```

有上面代码可以看出， `handleCallback` 方法是关联两个就行 `Promise` 对象的关键，该方法的参数是一个对象，对象的 `onFulfilled` 属性是老 `Promise` 对象的回调函数， `resolve` 属性是新对象的构造函数的 `resolve` 方法，也可以说是新对象的 `resolve` 方法。因为构造函数的 `resolve` 函数是一个闭包，里面的 self 保存的是对应实例化的 `Promise` 对象。

当第一个对象的 `onFulfilled` 函数为空， 直接把一个对象的终值 `value` 作为第二个对象的 `resolve` 参数。

```js
var a = new Promise(function(resolve) {
    resolve(2);
})

a.then().then(x => console.log(x))   //  => 2
```

于是 handleCallback 函数修改成：

```js
function handleCallback(callback) {
	if(self.state === 'pending') {
		self.callbacks.push(callback);return;
	}

	if(!callback.onFulfilled) {
		callback.resolve(self.value);return;
	}

	var res = callback.onFulfilled(self.value);
	// 调用新的promise对象的resolve
	callback.resolve(res);
}
```

我们前面提到第一个对象的回调函数返回值等于第二个对象的 `resolve` 参数，它等同于下面形式：

```js
var a = new Promise(function(resolve) {
    resolve(1);
})

a.then(x => {
    return new Promise(function(resolve){
        resolve(x+1)
    })
}).then(x => console.log(x))
```

于是要考虑调用第一个对象回调会返回 `thenable` 对象的情况，这个时候应该把由 `a.then()` 创建的对象的 `resolve` 对象这个 `thenable` 对象的成功回调， 状态受到里面 `thenable` 对象的状态影响， 所以终值始终等于这个 `thenable` 对象的终值。于是，`resolve` 修改成：

```js
function resolve(endValue) {
	if(endValue && (typeof endValue === 'object') && typeof endValue.then === 'function') {
   	  // 让新的promise对象的resolve作为thenable对象的成功回调
		endValue.then(resolve);
		return;
	}

	self.state = 'fulfilled';
	self.value = endValue;
	// 让所有回调函数进入下一个事件循环执行
	setTimeout(function(){
		self.callbacks.forEach(function(callback) {
			handleCallback(callback);
		})
	},0);
}
```

## 失败处理

和成功 `fulfilled` 的处理逻辑一样，我们引入失败的状态 `rejected` 和失败回调 `onRejected`

```js
function _Promise(fn) {
    var self = this;

    this.state = 'pending';
    this.value = null;
    this.callbacks = [];

    this.then = function(onFulfilled, onRejected) {
        // 返回一个新的Promise对象
        return new _Promise(function(resolve, reject) {
            handleCallback({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject
            })
        })
    }

    function handleCallback(callback) {
        if(self.state === 'pending') {
            self.callbacks.push(callback);return;
        }

        var cb = self.state === 'fulfilled' ? callback.onFulfilled : callback.onRejected;
        if(cb === null) {
            cb = self.state === 'fulfilled' ? callback.resolve : callback.reject;
            cb(self.value);
            return;
        }

        // 加入try-catch防止执行回调出错
        try {
            var res = cb(self.value);
            callback.resolve(res);    
        }catch(e) {
            callback.reject(e);
        }
    }

    function resolve(endValue) {
        if(endValue && (typeof endValue === 'object') && typeof endValue.then === 'function') {
            endValue.then(resolve, reject);
            return;
        }

        self.state = 'fulfilled';
        self.value = endValue;
        excute();
    }

    function reject(reason) {
        self.state = 'rejected';
        self.value = reason;
        excute();
    }

    function excute() {
        // 让所有回调函数进入下一个事件循环执行
        setTimeout(function(){
            self.callbacks.forEach(function(callback) {
                handleCallback(callback);
            })
        },0);
    }

    fn(resolve, reject)
}
```

加入 `try-catch` 保证在执行回调出错的时候能捕捉得到。如果执行回调成功，新的 `Promise` 总是成功 `fulfilled` 的，不管你之前的 `Promise` 对象是调用 `resolve` 还是 `reject` 。

## 总结

理解 `Promise` 源码的关键点如下：

- `then` 函数在 `Promise` 为 `pending` 状态时为注册回调，统一压到一个回调数组，所以我们会发现上面的测试例子的 `callbacks` 都是空数组，然后在 `resolve` 或者 `reject` 时才会统一执行。在其他状态注册都会直接执行。

- `then` 函数返回一个新的 `Promise` 对象，两个对象通过 `resolve`(前者对象的终值) 关联起来。
