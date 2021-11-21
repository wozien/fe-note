

# 性能优化

在理解了页面渲染原理后，探讨几个常见页面性能问题并总结页面性能优化的常用方法。

## JS如何影响DOM树的构建

```html

<html>
<body>
    <div>1</div>
    <script>
    let div1 = document.getElementsByTagName('div')[0]
    div1.innerText = 'time.geekbang'
    </script>
    <div>test</div>
</body>
</html>
```

浏览器在上面html构建DOM树过程中，在解析到`<script>`标签的时候，渲染引擎判断这是一段脚本，此时HTML解析器就会暂停DOM的解析，因为接下来JS有可能会修改当前已经生成的DOM。对于用src属性加载的js也是同样道理。

再来看下存在css文件的情况：

```css

//theme.css
div {color:blue}
```

```html

<html>
    <head>
        <style src='theme.css'></style>
    </head>
<body>
    <div>1</div>
    <script>
            let div1 = document.getElementsByTagName('div')[0]
            div1.innerText = 'time.geekbang' //需要DOM
            div1.style.color = 'red'  //需要CSSOM
        </script>
    <div>test</div>
</body>
</html>
```

对于这种情况，JS引擎在解析代码前是不知道JS是否会操纵CSSOM的，所以渲染引擎在遇到JS脚本时，不管脚本是否操作了CSSOM，都会先去执行CSS文件下载，解析操作，再执行JS脚本。

## 为什么CSS动画比较高效

在写 Web 应用的时候，你可能经常需要对某个元素做几何形状变换、透明度变换或者一些缩放操作，如果使用 JavaScript 来写这些效果，会牵涉到整个渲染流水线，所以 JavaScript 的绘制效率会非常低下。

这个时候可以使用 `will-change` 来告诉渲染引擎你对该元素做了一些特效变换，CSS代码如下：

```css

.box {
will-change: transform, opacity;
}
```

这段代码告诉渲染引擎box元素需要做几何变换和透明度操作，这是渲染引擎就会把该元素提升单独的图层，等这些变换发生时，通过合成线程直接去操作对应的图层即可。然后这些变换没有涉及到主线程，这样就大大提升了渲染的效率。

## 页面性能优化总结

我们把可能会阻塞页面首次渲染的资源成为关键资源。

### 加载阶段

1. 减少关键资源个数。增加async或者defer标识
2. 减少关键资源大小。压缩，移除死代码等
3. 减少关键资源RTT次数。CDN访问

### 交互阶段

1. 减少Javascript脚本执行时间。可以将大任务分解成多个任务，或者利用web worker来并行计算密集任务

2. 避免同步布局

   ```js
   
   function foo() {
       let main_div = document.getElementById("mian_div")
       let new_node = document.createElement("li")
       let textnode = document.createTextNode("time.geekbang")
       new_node.appendChild(textnode);
       document.getElementById("mian_div").appendChild(new_node);
       //由于要获取到offsetHeight，
       //但是此时的offsetHeight还是老的数据，
       //所以需要立即执行布局操作
       console.log(main_div.offsetHeight)
   }
   ```

   所谓同步布局就是指Javascript强制将计算样式和布局操作提前到当前的任务中。

3. 避免布局抖动

   ```js
   
   function foo() {
       let time_li = document.getElementById("time_li")
       for (let i = 0; i < 100; i++) {
           let main_div = document.getElementById("mian_div")
           let new_node = document.createElement("li")
           let textnode = document.createTextNode("time.geekbang")
           new_node.appendChild(textnode);
           new_node.offsetHeight = time_li.offsetHeight;
           document.getElementById("mian_div").appendChild(new_node);
       }
   }
   ```

   是指在一次Javascript运行过程中，多次强制布局和抖动操作

4. 合理利用CSS动画

   因为CSS合成动画是在合成线程完成的，不会占用主线程

5. 避免频繁的垃圾回收

   WeakMap，WeakSet优化

