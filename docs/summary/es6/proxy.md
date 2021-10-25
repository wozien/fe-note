我们知道在es5中 ``Object.definePropety()`` 方法可以设置对象属性的 ``getter`` 和 ``setter``，从而拦截对象属性的存取行为。但是局限性挺大，比如无法拦截数组的存取和其他对象的行为比如(``in`` 和 ``delele`` 等)。于是，es6引入了代理( ``Proxy`` )，它是一种可以拦截并改变底层js操作的包装器。


## 基本用法

用 ``new Proxy(target, handler)`` 新建一个代理对象，``target`` 表示代理的目标对象，``handler`` 是一个拦截行为的配置对象。

```js
let obj = {
  name: 'wozien'
};

let proxy = new Proxy(obj, {});

console.log(proxy.name);
proxy.name = 'aaa';
console.log(obj.name);
```

当 ``handler`` 是个空对象时，代理只是简单的转发目标的默认行为。es6为我们提供了13种拦截行为的配置，并用 ``Reflect`` 对象提供操作JS的默认行为。

比如用 ``get()`` 拦截代理对象的值的获取行为：

```js
let obj = {
  name: 'wozien'
};

obj = new Proxy(obj, {
  get(target, key) {
    console.log('proxy get');
    return Reflect.get(target, key);
  }
});
console.log(obj.name);

// proxy get
// wozien
```

用 ``set()`` 设置代理对象的值设置行为：

```js
let obj = {
  name: 'wozien'
};

obj = new Proxy(obj, {
  set(target, key, value) {
    console.log('proxy set');
    return Reflect.set(target, key, value);
  }
});

obj.name = 'marry';   // proxy set
console.log(obj.name);  // marry
```

使用 ``has()`` 设置代理对象 ``in`` 操作行为，比如隐藏对象的某些属性:

```js
let obj = {
  name: 'wozien',
  _age: 12
};

let proxy = new Proxy(obj, {
  has(target, key) {
    if (key[0] === '_') {
      return false;
    }
    return Reflect.has(target, key);
  }
});

console.log('_age' in proxy); // false
```

使用 ``ownKeys()`` 设置拦截对象的 ``Object.keys()``，``for...in`` 等操作的行为：

```js
let obj = {
  name: 'wozien',
  _age: 12
};

let proxy = new Proxy(obj, {
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(key => {
      return typeof key !== 'string' || key[0] !== '_';
    });
  }
});

for (let key in proxy) {
  console.log(key);
}

// name
```

其他更多的代理拦截行为设置参考[Proxy-MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

## 可撤销代理

利用 ``Proxy.revocale()`` 方法创建可以撤销的代理对象。该方法返回一个含有下面两个属性的对象：

- proxy: 可撤销的代理对象
- revoke: 可撤销代理的方法

调用 ``revoke()`` 方法后，代理对象不能进一步操作：

```js
let obj = {
  name: 'wozien'
};

let { proxy, revoke } = Proxy.revocable(obj, {});

console.log(proxy.name);  // wozien

revoke();

console.log(proxy.name); // Cannot perform 'get' on a proxy that has been revoked
```

## 应用

### 监测数组

我们知道在es5中无法检测数组的存取行为，利用 ``Proxy`` 可以轻松完成这个任务：

```js
let proxy = new Proxy([], {
  get(arr, key) {
    console.log('proxy get ' + key);
    return arr[key];
  },
  set(arr, key, val) {
    console.log('proxy set ' + key + ': ' + val);
    return (arr[key] = val);
  }
});

proxy[0] = 1;

console.log(proxy[0]);

// proxy set 0: 1
// proxy get 0
// 1
```

### 替代Object.defineProperty()

``Object.defineProperty()`` 是监测对象的属性存取，如果要使整个对象可监测，就要循环设置：

```js
function define(obj, key) {
  let value = obj[key];
  Object.defineProperty(obj, key, {
    get() {
      console.log('get obj prop ' + key);
      return value;
    },
    set(newVal) {
      console.log('set obj prop ' + key + ' to ' + newVal);
      value = newVal;
    }
  });
}

function observer(obj) {
  for (let key in obj) {
    define(obj, key);
  }
}

let obj = {
  name: 'wozien',
  age: 23
};

// 侦测obj数据
observer(obj);

obj.name;
obj.name = 'marry';
obj.age = 25;

// get obj prop name
// set obj prop name to marry
// set obj prop age to 25
```

利用 ``Proxy`` 的 ``set()`` 和 ``get()`` 设置拦截对象的存取行为：

```js
function observe(obj) {
  return new Proxy(obj, {
    get(target, key) {
      console.log('get obj prop ' + key);
      return target[key];
    },
    set(target, key, newVal) {
      console.log('set obj prop ' + key + ' to ' + newVal);
      return (target[key] = newVal);
    }
  });
}

let obj = {
  name: 'wozien',
  age: 23
};

obj = observe(obj);

obj.name;
obj.name = 'marry';
obj.age = 25;
```

### 模拟数组行为

我们知道数组可以通过设置不存在的索引扩大数组长度，通过设置小于数组长度时可以删除元素。在es5我们无法用对象模拟这种行为，而利用 ``Proxy`` 可以实现：

```js
function isArrayIndex(value) {
  let num = Number(value);
  return typeof num === 'number' && num >= 0;
}

function createArray(length = 0) {
  return new Proxy(
    { length },
    {
      set(target, key, value) {
        let curLength = target.length;

        if (isArrayIndex(key)) {
          let num = Number(key);
          if (num >= curLength) {
            target.length = num + 1;
          }
        } else if (key === 'length') {
          if (value < curLength) {
            for (let index = curLength - 1; index >= value; index--) {
              delete target[index];
            }
          }
        }

        target[key] = value;
      }
    }
  );
}

let arr = createArray(1);

arr[0] = 11;
arr[1] = 12;
arr[2] = 13;

console.log(arr.length); // 3
console.log(arr[1]);  // 12

arr.length = 1;
console.log(arr.length); // 1
console.log(arr[1]); // undefiend
```

### 监测类属性类型

可以在类构造函数中返回实例对象的代理，代理可以在 ``set()`` 监测对象属性值的类型:

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
    return new Proxy(this, {
      set(target, key, value) {
        if (typeof value !== Person.propTypes[key]) {
          throw new TypeError('property type error');
        }
        return Reflect.set(target, key, value);
      }
    });
  }
}

Person.propTypes = {
  name: 'string',
  age: 'number'
};

let person = new Person('wozien', 12);

person.name = 12; // throw new TypeError('property type error');
```

## 参考

[ES6 系列之 defineProperty 与 proxy](https://github.com/mqyqingfeng/Blog/issues/107)