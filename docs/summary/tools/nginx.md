# Nginx 速查

Nginx是一款轻量级的HTTP服务器，采用事件驱动的异步非阻塞处理方式框架，这让其具有极好的IO性能，时常用于服务端的反向代理和负载均衡。

## 常用命令

### 柔和重启
```bash
nginx -s reload
```

### 配置文件检查
```bash
nginx -t
```

## 常用配置

### 反向代理
```bash
server {  
  listen 80;                                                         
  server_name localhost;                                               
  client_max_body_size 1024M;

  location / {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host:$server_port;
  }
}
```

### 负载均衡
```bash
upstream test {
  server localhost:8080;
  server localhost:8081;
}
server {
  listen 81;                                                         
  server_name localhost;                                               
  client_max_body_size 1024M;

  location / {
    proxy_pass http://test;
    proxy_set_header Host $host:$server_port;
  }
}
```

### http服务器
```bash
server {
  listen 80;                                                         
  server_name localhost;                                               
  client_max_body_size 1024M;

  location / {
    root e:\wwwroot;
    index index.html;
  }
}
```

### 动静分离
```bash
upstream test{  
  server localhost:8080;  
  server localhost:8081;  
}   

server {  
  listen 80;  
  server_name localhost;  

  location / {  
    root e:\wwwroot;  
    index index.html;  
  }  

  --所有静态请求都由nginx处理，存放目录为html  
  location ~ \.(gif|jpg|jpeg|png|bmp|swf|css|js)$ {  
    root e:\wwwroot;  
  }  

  --所有动态请求都转发给tomcat处理  
  location ~ \.(jsp|do)$ {  
    proxy_pass http://test;  
  }  

  error_page 500 502 503 504 /50x.html;  
  location = /50x.html {  
    root e:\wwwroot;  
  }  
}
```

### 正向代理
```bash
resolver 114.114.114.114 8.8.8.8;
  server {
    resolver_timeout 5s;

    listen 81;

    access_log e:\wwwroot\proxy.access.log;
    error_log e:\wwwroot\proxy.error.log;

    location / {
      proxy_pass http://$host$request_uri;
    }
  }

#防盗链
location ~* \.(gif|jpg|png)$ {
    # 只允许 192.168.0.1 请求资源
    valid_referers none blocked 192.168.0.1;
    if ($invalid_referer) {
       rewrite ^/ http://$host/logo.png;
    }
}
```

### 根据文件类型设置过期时间
```bash
location ~.*\.css$ {
    expires 1d;
    break;
}
location ~.*\.js$ {
    expires 1d;
    break;
}

location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
    access_log off;
    expires 15d; #保存15天
    break;
}
```

## 匹配规则

```bash
location = / {
  # 精确匹配 / ，主机名后面不能带任何字符串
  [ configuration A ]
}

location / {
  # 因为所有的地址都以 / 开头，所以这条规则将匹配到所有请求
  # 但是正则和最长字符串会优先匹配
  [ configuration B ]
}

location /documents/ {
  # 匹配任何以 /documents/ 开头的地址，匹配符合以后，还要继续往下搜索
  # 只有后面的正则表达式没有匹配到时，这一条才会采用这一条
  [ configuration C ]
}

location ~ /documents/Abc {
  # 匹配任何以 /documents/Abc 开头的地址，匹配符合以后，还要继续往下搜索
  # 只有后面的正则表达式没有匹配到时，这一条才会采用这一条
  [ configuration CC ]
}

location ^~ /images/ {
  # 匹配任何以 /images/ 开头的地址，匹配符合以后，停止往下搜索正则，采用这一条。
  [ configuration D ]
}

location ~* \.(gif|jpg|jpeg)$ {
  # 匹配所有以 gif,jpg或jpeg 结尾的请求
  # 然而，所有请求 /images/ 下的图片会被 config D 处理，因为 ^~ 到达不了这一条正则
  [ configuration E ]
}

location /images/ {
  # 字符匹配到 /images/，继续往下，会发现 ^~ 存在
  [ configuration F ]
}

location /images/abc {
  # 最长字符匹配到 /images/abc，继续往下，会发现 ^~ 存在
  # F与G的放置顺序是没有关系的
  [ configuration G ]
}

location ~ /images/abc/ {
  # 只有去掉 config D 才有效：先最长匹配 config G 开头的地址，继续往下搜索，匹配到这一条正则，采用
    [ configuration H ]
}
```

## 常见问题
```bash
# root 和 alias的区别？
**root**
location /i/ {
  root /data/w3;
}
真实的路径是root指定的值加上location指定的值,即/data/w3/i/...

**alias**
location /i/ {
  alias /data/w3/;
}
在服务器查找的资源路径是： /data/w3/...
```