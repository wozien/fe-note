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
var ipt = document.getElementById('input');
ipt.addEventListener('keyup', function(e){
  console.log(e.target.value);
});
```

结果如下：

<img src="http://blog.inoob.xyz/posts/191efe/1.gif" width="250"/>

可见，每次触发事件都会执行回调函数，现在加入防抖处理：

```js

var debounce = function(func, delay) {
  var timer = null
  return function() {
      var that = this;
      var args = arguments;
      
      if(timer) {
          clearTimeout(timer);
      }

      timer = setTimeout(function() {
          func.apply(that, args);
      }, delay)
  }
}

ipt.addEventListener('keyup', debounce(function(e){
  console.log(e.target.value);
}, 400))
```

效果如下：

<img src="http://blog.inoob.xyz/posts/191efe/2.gif" />

可见，输入框在停止输入400ms后执行回调。在防抖后的回调函数用 ``timer`` 记录计时，每次执行回调的时候会先清空之前的计时。注意这里的``timer``是闭包变量，始终保持着上一个计时。

## 函数节流

节流``throttle``: 让事件的回调一定时间间隔只执行一次。节流函数有两种实现方式，一种是记录增量，一种是定时方式。

用增量的方式实现节流：

```js
var throttle = function(func, delay) {
    var pre = Date.now();
    return function() {
        var that = this;
        var args = arguments;
        var now = Date.now();

        if (now - pre >= delay) {
            func.apply(that, args);
            pre = now;
        }
    }
}

ipt.addEventListener('keyup', throttle(function(e){
    console.log(e.target.value);
}, 1000))
```

节流的效果如下：

<img src="http://blog.inoob.xyz/posts/191efe/3.gif" />

可见，无论怎么输入，事件回调总会在1s内执行一次。而且第一次输入会马上执行，这是因为处理节流的时候和第一次触发的时间间隔大于1s。但是最后一次触发不会执行回调。

利用计时方式处理节流：

```js
var throttle = function(func, delay) {
    var timer = null;
    return function() {
        var that = this;
        var args = arguments;

        if(!timer) {
            timer = setTimeout(function() {
                func.apply(that, args);
                timer = null;
            }, delay)
        }
    }
}
```

利用变量 ``timer`` 记录定时器，如果定时器存在，则不执行回调。否则创建一个延时器执行回调。这种方法和时间戳增量的区别就是第一个触发不会立即执行回调，但是最后一次时间会在延时后触发回调函数。

如果想要立即触发并且最后一次也要执行回调，可以利用时间戳和计时方式结合在实现节流：

```js
var throttle = function(func, delay) {
    var timer = null;
    var pre = Date.now();
    return function() {
        var now = Date.now();
        var that = this;
        var args = arguments;
        var remain = delay - (now - pre);

        clearTimeout(timer);
        if (remain <= 0) {
            func.apply(that, args);
            pre = now
        }else {
            timer = setTimeout(function() {
                func.apply(that, args);
                pre = now;
            }, remain)
        }
    }
}
```

上面的节流函数会先判断剩余的间隔时间，如果剩余时间小于0，则立即执行。否则创建一个剩余时间的定时。注意，每次要记得清空之前的定时。

## 应用场景

防抖 ``debounce`` 一般用来在输入检索，节约请求的资源。还有窗口的 ``resize``，让不断调节窗口大小的最后一次触发。

节流 ``throttle`` 一般用在鼠标不断点击，让点击的回调按间隔执行一次。还有滑动 ``scroll`` 事件， 比如滚动到底部查询，按间隔请求一次数据来显示。


## 参考文章

[https://juejin.im/post/5b8de829f265da43623c4261](https://juejin.im/post/5b8de829f265da43623c4261)

[https://mp.weixin.qq.com/s/Vkshf-nEDwo2ODUJhxgzVA](https://mp.weixin.qq.com/s/Vkshf-nEDwo2ODUJhxgzVA)