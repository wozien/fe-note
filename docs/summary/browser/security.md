# 浏览器安全

## 同源策略

如果两个URL的协议，域名和端口都相同，称这两个URL为同源。不同源的资源之间有一套安全策略进行限制，我们成为同源策略。主要表现以下三个方面：

- DOM层面-不同源的JS脚本不能对当前DOM对象进行读写操作
- 数据层面-不同源页面无法共享cookie，indexDB和localStorage数据
- 网路层面-XHR默认无法跨域请求

为了平衡web应用的安全性和便利性，针对上面的3中同源策略都有对应放宽机制：

- 通过CSP来限制加载第三方资源的自由度
- 使用html5的postMessage来进行跨页面数据共享
- 利用CORS解决跨域问题

## XSS攻击

XSS 全称是 Cross Site Scripting，为了与“CSS”区分开来，故简称 XSS，翻译过来就是“跨站脚本”。XSS 攻击是指黑客往 HTML 文件中或者 DOM 中注入恶意脚本，从而在用户浏览页面时利用注入的恶意脚本对用户实施攻击的一种手段。

### 存储型XSS

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/2ed3d8b93035df3c2bcfcc223dc47914.webp)

存储型XSS攻击的大致步骤如下：

- 首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中
- 然后用户向网站请求包含了恶意 JavaScript 脚本的页面
- 当用户浏览该页面的时候，恶意脚本就会将用户的 Cookie 信息等数据上传到服务器

### 反射型 XSS 攻击

在一个反射型 XSS 攻击过程中，恶意 JavaScript 脚本属于用户发送给网站请求中的一部分，随后网站又把恶意 JavaScript 脚本返回给用户。当恶意 JavaScript 脚本在用户页面中被执行时，黑客就可以利用该脚本做一些恶意操作。

如下漏洞代码：

```js

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',xss:req.query.xss });
});


module.exports = router;

// index.ejs
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel='stylesheet' href='/stylesheets/style.css' />
</head>
<body>
  <h1><%= title %></h1>
  <p>Welcome to <%= title %></p>
  <div>
      <%- xss %>
  </div>
</body>
</html>
```

但当打开 `http://localhost:3000/?xss=这段` URL 时，其结果如下图所示：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/4dff7d83fe2eecc6cb52c126b4f650fa.webp)

通过这个操作，我们会发现用户将一段含有恶意代码的请求提交给 Web 服务器，Web 服务器接收到请求时，又将恶意代码反射给了浏览器端，这就是反射型 XSS 攻击。

另外需要注意的是，Web 服务器不会存储反射型 XSS 攻击的恶意脚本，这是和存储型 XSS 攻击不同的地方。

### 基于 DOM 的 XSS 攻击

基于 DOM 的 XSS 攻击是不牵涉到页面 Web 服务器的。具体来讲，黑客通过各种手段将恶意脚本注入用户的页面中，比如通过网络劫持在页面传输过程中修改 HTML 页面的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web 资源传输过程或者在用户使用页面的过程中修改 Web 页面的数据。

### 如何阻止XSS攻击

1. 服务器对输入脚本进行过滤或转码
2. 充分利用 CSP，限制加载其他域下的资源文件
3. 使用 `HttpOnly`属性

## CSRF

CSRF 英文全称是 Cross-site request forgery，所以又称为“跨站请求伪造”，是指黑客引诱用户打开黑客的网站，在黑客的网站中，利用用户的登录状态发起的跨站请求。简单来讲，CSRF 攻击就是黑客利用了用户的登录状态，并通过第三方的站点来做一些坏事。

### 攻击方式

通常当用户打开了黑客的页面后，黑客有三种方式去实施 CSRF 攻击。

1. 自动发起 Get 请求

   ```html
   
   <!DOCTYPE html>
   <html>
     <body>
       <h1>黑客的站点：CSRF攻击演示</h1>
       <img src="https://time.geekbang.org/sendcoin?user=hacker&number=100">
     </body>
   </html>
   ```

   2.自动发起 POST 请求

   ```html
   
   <!DOCTYPE html>
   <html>
   <body>
     <h1>黑客的站点：CSRF攻击演示</h1>
     <form id='hacker-form' action="https://time.geekbang.org/sendcoin" method=POST>
       <input type="hidden" name="user" value="hacker" />
       <input type="hidden" name="number" value="100" />
     </form>
     <script> document.getElementById('hacker-form').submit(); </script>
   </body>
   </html>
   ```

   3.引诱用户点击链接

   ```html
   
   <div>
     <img width=150 src=http://images.xuejuzi.cn/1612/1_161230185104_1.jpg> </img> </div> <div>
     <a href="https://time.geekbang.org/sendcoin?user=hacker&number=100" taget="_blank">
       点击下载美女照片
     </a>
   </div>
   ```

和 XSS 不同的是，CSRF 攻击不需要将恶意代码注入用户的页面，仅仅是利用服务器的漏洞和用户的登录状态来实施攻击。

### 如何预防CSRF攻击

发起 CSRF 攻击的三个必要条件：

- 第一个，目标站点一定要有 CSRF 漏洞；
- 第二个，用户要登录过目标站点，并且在浏览器上保持有该站点的登录状态；
- 第三个，需要用户打开一个第三方站点，可以是黑客的站点，也可以是一些论坛。

预防攻击的方式：

- 充分利用好 Cookie 的 SameSite 属性
- 验证请求的来源站点， 利用HTTP 请求头中的 Referer 和 Origin 属性
- CSRF Token。由服务端生成，客户端请求时携带。

## HTTPS

从 HTTP 协议栈层面来看，我们可以在 TCP 和 HTTP 之间插入一个安全层，所有经过安全层的数据都会被加密或者解密，你可以参考下图：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/9e99f797de30a15a11b0e4b4c8f810cf.webp)

从图中我们可以看出 HTTPS 并非是一个新的协议，通常 HTTP 直接和 TCP 通信，HTTPS 则先和安全层通信，然后安全层再和 TCP 层通信。总的来说，安全层有两个主要的职责：对发起 HTTP 请求的数据进行加密操作和对接收到 HTTP 的内容进行解密操作。

### 加密方式

HTTPS采用的是混合加密方式。那就是在传输数据阶段依然使用对称加密，但是对称加密的密钥我们采用非对称加密来传输。

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/d5cd34dbf3636ebc0e809aa424c53845.webp)

### 数字证书

数字证书是指权威机构CA（Certificate Authority）给服务器证明身份的一种方式，它可以有效的防止DNS劫持，伪造服务器身份。包含数字证书的请求流程如下：

![](https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/77c852ff2202b2b7bb3299a96a0f4aaf.webp)

比起没有证书的流程，主要有两点变化：

- 服务器没有直接返回公钥给浏览器，而是返回了数字证书，而公钥正是包含在数字证书中的；
- 在浏览器端多了一个证书验证的操作，验证了证书之后，才继续后续流程。

数字证书的申请

- 服务器准备一套私钥和公钥，私钥留着自己使用；
- 向 CA 机构提交公钥、公司、站点等信息并等待认证
- CA使用hash函数对服务信息进行加密得出信息摘要，并用自己的私钥进行加密生成证书签名

浏览器验证证书

- 浏览器对证书的服务器信息铭文进行hash计算，得出信息摘要A
- 再利用对应的CA公钥对签名进行证书解密，得到信息摘要B
- 对比A和B，如果一致，证明服务器已经得到对应CA机构的证明

> 上面的步骤只是证明对应的CA机构，如果该机构是比较小众的话， 还需要通过该CA的证书往上级找到它的父CA，直到找到根CA(一般会预置在OS中)，这样就形成了一个证书链的验证

