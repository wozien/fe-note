# 函数防抖和节流

在浏览器中如果一个事件被频繁触发，比如输入框的 ``keyup``, 窗口的 ``resize`` 以及 ``scroll`` 事件等，如果不做任何处理，事件的回调函数将会对应执行，这必然会加重浏览器的负担，影响用户的体验。面对这种场景，我们可以用函数的防抖 ``(debounce)`` 和节流 ``(throttle)`` 来处理。

## 函数防抖

防抖 ``debounce``:  让事件触发时的回调在一定的延时后执行。如果在计时期间又触发了事件，则重新开始计时。

比如在做一个检索的输入框，输入的内容发送给后台查询。如果不做防抖处理我们来看下：

```html
<input type="text" id="input">
```

用打印来模拟请求处理：

```js
const ipt = document.getElementById('input');
ipt.addEventListener('keyup', function(e){
  console.log(e.target.value);
});
```

结果如下：

<img src="https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/202210111138.gif"/>

可见，每次触发事件都会执行回调函数，现在加入防抖处理：

```js
/**
 * 函数防抖
 * @param {*} func 函数
 * @param {*} delay 延时
 * @param {*} flag 是否第一次执行
 */
function debounce(func, delay, flag) {
  let timer;
  return function(...args) {
    timer && clearTimeout(timer);

    if(flag && !timer) {
      func.apply(this, args);
    }

    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay);
  }
}

ipt.addEventListener('keyup', debounce(function(e){
  console.log(e.target.value);
}, 400));
```

效果如下：

<img src="https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/20221011_1336.gif" />

可见，输入框在停止输入400ms后执行回调。在防抖后的回调函数用 ``timer`` 记录计时，每次执行回调的时候会先清空之前的计时。注意这里的``timer``是闭包变量，始终保持着上一个计时。

## 函数节流

节流``throttle``: 让函数每隔一段时间内执行一次，常用在 `下拉滚动加载` 

```js
/**
 * 函数节流
 * @param {*} func 函数
 * @param {*} delay 延时
 * @param {*} flag 是否第一次执行
 */
function throttle(func, delay, flag) {
  let timer;
  return function(...args) {
    if(flag) {
      func.apply(this, args);
      flag = false;
    }

    if(!timer) {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, delay);
    }
  }
}

ipt.addEventListener('keyup', throttle(function(e){
  console.log(e.target.value);
}, 400));
```

节流的效果如下：

<img src="https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/20221011_1350.gif" />


## 应用场景

防抖 ``debounce`` 一般用来在输入检索，节约请求的资源。还有窗口的 ``resize``，让不断调节窗口大小的最后一次触发。

节流 ``throttle`` 一般用在鼠标不断点击，让点击的回调按间隔执行一次。还有滑动 ``scroll`` 事件， 比如滚动到底部查询，按间隔请求一次数据来显示。


## 参考文章

[https://juejin.im/post/5b8de829f265da43623c4261](https://juejin.im/post/5b8de829f265da43623c4261)

[https://mp.weixin.qq.com/s/Vkshf-nEDwo2ODUJhxgzVA](https://mp.weixin.qq.com/s/Vkshf-nEDwo2ODUJhxgzVA)