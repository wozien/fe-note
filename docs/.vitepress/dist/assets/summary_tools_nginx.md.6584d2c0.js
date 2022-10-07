import{_ as s,c as n,o as a,a as l}from"./app.a7159b07.js";const i=JSON.parse('{"title":"Nginx \u901F\u67E5","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u5E38\u7528\u547D\u4EE4","slug":"\u5E38\u7528\u547D\u4EE4"},{"level":3,"title":"\u67D4\u548C\u91CD\u542F","slug":"\u67D4\u548C\u91CD\u542F"},{"level":3,"title":"\u914D\u7F6E\u6587\u4EF6\u68C0\u67E5","slug":"\u914D\u7F6E\u6587\u4EF6\u68C0\u67E5"},{"level":2,"title":"\u5E38\u7528\u914D\u7F6E","slug":"\u5E38\u7528\u914D\u7F6E"},{"level":3,"title":"\u53CD\u5411\u4EE3\u7406","slug":"\u53CD\u5411\u4EE3\u7406"},{"level":3,"title":"\u8D1F\u8F7D\u5747\u8861","slug":"\u8D1F\u8F7D\u5747\u8861"},{"level":3,"title":"http\u670D\u52A1\u5668","slug":"http\u670D\u52A1\u5668"},{"level":3,"title":"\u52A8\u9759\u5206\u79BB","slug":"\u52A8\u9759\u5206\u79BB"},{"level":3,"title":"\u6B63\u5411\u4EE3\u7406","slug":"\u6B63\u5411\u4EE3\u7406"},{"level":3,"title":"\u6839\u636E\u6587\u4EF6\u7C7B\u578B\u8BBE\u7F6E\u8FC7\u671F\u65F6\u95F4","slug":"\u6839\u636E\u6587\u4EF6\u7C7B\u578B\u8BBE\u7F6E\u8FC7\u671F\u65F6\u95F4"},{"level":2,"title":"\u5339\u914D\u89C4\u5219","slug":"\u5339\u914D\u89C4\u5219"},{"level":2,"title":"\u5E38\u89C1\u95EE\u9898","slug":"\u5E38\u89C1\u95EE\u9898"}],"relativePath":"summary/tools/nginx.md"}'),p={name:"summary/tools/nginx.md"},o=l(`<h1 id="nginx-\u901F\u67E5" tabindex="-1">Nginx \u901F\u67E5 <a class="header-anchor" href="#nginx-\u901F\u67E5" aria-hidden="true">#</a></h1><p>Nginx\u662F\u4E00\u6B3E\u8F7B\u91CF\u7EA7\u7684HTTP\u670D\u52A1\u5668\uFF0C\u91C7\u7528\u4E8B\u4EF6\u9A71\u52A8\u7684\u5F02\u6B65\u975E\u963B\u585E\u5904\u7406\u65B9\u5F0F\u6846\u67B6\uFF0C\u8FD9\u8BA9\u5176\u5177\u6709\u6781\u597D\u7684IO\u6027\u80FD\uFF0C\u65F6\u5E38\u7528\u4E8E\u670D\u52A1\u7AEF\u7684\u53CD\u5411\u4EE3\u7406\u548C\u8D1F\u8F7D\u5747\u8861\u3002</p><h2 id="\u5E38\u7528\u547D\u4EE4" tabindex="-1">\u5E38\u7528\u547D\u4EE4 <a class="header-anchor" href="#\u5E38\u7528\u547D\u4EE4" aria-hidden="true">#</a></h2><h3 id="\u67D4\u548C\u91CD\u542F" tabindex="-1">\u67D4\u548C\u91CD\u542F <a class="header-anchor" href="#\u67D4\u548C\u91CD\u542F" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">nginx -s reload</span></span>
<span class="line"></span></code></pre></div><h3 id="\u914D\u7F6E\u6587\u4EF6\u68C0\u67E5" tabindex="-1">\u914D\u7F6E\u6587\u4EF6\u68C0\u67E5 <a class="header-anchor" href="#\u914D\u7F6E\u6587\u4EF6\u68C0\u67E5" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">nginx -t</span></span>
<span class="line"></span></code></pre></div><h2 id="\u5E38\u7528\u914D\u7F6E" tabindex="-1">\u5E38\u7528\u914D\u7F6E <a class="header-anchor" href="#\u5E38\u7528\u914D\u7F6E" aria-hidden="true">#</a></h2><h3 id="\u53CD\u5411\u4EE3\u7406" tabindex="-1">\u53CD\u5411\u4EE3\u7406 <a class="header-anchor" href="#\u53CD\u5411\u4EE3\u7406" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">server </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  listen 80</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">                                                         </span></span>
<span class="line"><span style="color:#A6ACCD;">  server_name localhost</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">                                               </span></span>
<span class="line"><span style="color:#A6ACCD;">  client_max_body_size 1024M</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  location / </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    proxy_pass http://localhost:8080</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    proxy_set_header Host </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">host:</span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">server_port</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="\u8D1F\u8F7D\u5747\u8861" tabindex="-1">\u8D1F\u8F7D\u5747\u8861 <a class="header-anchor" href="#\u8D1F\u8F7D\u5747\u8861" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">upstream </span><span style="color:#82AAFF;">test</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  server localhost:8080</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  server localhost:8081</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">server </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  listen 81</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">                                                         </span></span>
<span class="line"><span style="color:#A6ACCD;">  server_name localhost</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">                                               </span></span>
<span class="line"><span style="color:#A6ACCD;">  client_max_body_size 1024M</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  location / </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    proxy_pass http://test</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    proxy_set_header Host </span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">host:</span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">server_port</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="http\u670D\u52A1\u5668" tabindex="-1">http\u670D\u52A1\u5668 <a class="header-anchor" href="#http\u670D\u52A1\u5668" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">server </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  listen 80</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">                                                         </span></span>
<span class="line"><span style="color:#A6ACCD;">  server_name localhost</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">                                               </span></span>
<span class="line"><span style="color:#A6ACCD;">  client_max_body_size 1024M</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  location / </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    root e:\\wwwroot</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    index index.html</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="\u52A8\u9759\u5206\u79BB" tabindex="-1">\u52A8\u9759\u5206\u79BB <a class="header-anchor" href="#\u52A8\u9759\u5206\u79BB" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">upstream test{  </span></span>
<span class="line"><span style="color:#A6ACCD;">  server localhost:8080</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  server localhost:8081</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">}   </span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">server </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  listen 80</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  server_name localhost</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  location / </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">    root e:\\wwwroot</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">    index index.html</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  --\u6240\u6709\u9759\u6001\u8BF7\u6C42\u90FD\u7531nginx\u5904\u7406\uFF0C\u5B58\u653E\u76EE\u5F55\u4E3Ahtml  </span></span>
<span class="line"><span style="color:#A6ACCD;">  location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;"> \\.</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">gif</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpg</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpeg</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">png</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">bmp</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">swf</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">css</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">js</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;">$ </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">    root e:\\wwwroot</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  --\u6240\u6709\u52A8\u6001\u8BF7\u6C42\u90FD\u8F6C\u53D1\u7ED9tomcat\u5904\u7406  </span></span>
<span class="line"><span style="color:#A6ACCD;">  location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;"> \\.</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">jsp</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">do</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;">$ </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">    proxy_pass http://test</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">  error_page 500 502 503 504 /50x.html</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  location = /50x.html </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">    root e:\\wwwroot</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">  </span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="\u6B63\u5411\u4EE3\u7406" tabindex="-1">\u6B63\u5411\u4EE3\u7406 <a class="header-anchor" href="#\u6B63\u5411\u4EE3\u7406" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">resolver 114.114.114.114 8.8.8.8</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">  server </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    resolver_timeout 5s</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">    listen 81</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">    access_log e:\\wwwroot\\proxy.access.log</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    error_log e:\\wwwroot\\proxy.error.log</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">    location / </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">      proxy_pass http://</span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">host</span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">request_uri</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;">#\u9632\u76D7\u94FE</span></span>
<span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~*</span><span style="color:#A6ACCD;"> \\.</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">gif</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpg</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">png</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;">$ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">    </span><span style="color:#676E95;"># \u53EA\u5141\u8BB8 192.168.0.1 \u8BF7\u6C42\u8D44\u6E90</span></span>
<span class="line"><span style="color:#A6ACCD;">    valid_referers none blocked 192.168.0.1</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">if</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">($</span><span style="color:#A6ACCD;">invalid_referer</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">       rewrite ^/ http://</span><span style="color:#89DDFF;">$</span><span style="color:#A6ACCD;">host/logo.png</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"></span></code></pre></div><h3 id="\u6839\u636E\u6587\u4EF6\u7C7B\u578B\u8BBE\u7F6E\u8FC7\u671F\u65F6\u95F4" tabindex="-1">\u6839\u636E\u6587\u4EF6\u7C7B\u578B\u8BBE\u7F6E\u8FC7\u671F\u65F6\u95F4 <a class="header-anchor" href="#\u6839\u636E\u6587\u4EF6\u7C7B\u578B\u8BBE\u7F6E\u8FC7\u671F\u65F6\u95F4" aria-hidden="true">#</a></h3><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;">.</span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;">\\.css$ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    expires 1d</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#82AAFF;">break</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;">.</span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;">\\.js$ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    expires 1d</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#82AAFF;">break</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;"> .</span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;">\\.</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">gif</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpg</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpeg</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">png</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">bmp</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">swf</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;">$ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    access_log off</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">    expires 15d</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">#\u4FDD\u5B5815\u5929</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#82AAFF;">break</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="\u5339\u914D\u89C4\u5219" tabindex="-1">\u5339\u914D\u89C4\u5219 <a class="header-anchor" href="#\u5339\u914D\u89C4\u5219" aria-hidden="true">#</a></h2><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">location = / </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u7CBE\u786E\u5339\u914D / \uFF0C\u4E3B\u673A\u540D\u540E\u9762\u4E0D\u80FD\u5E26\u4EFB\u4F55\u5B57\u7B26\u4E32</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration A </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location / </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u56E0\u4E3A\u6240\u6709\u7684\u5730\u5740\u90FD\u4EE5 / \u5F00\u5934\uFF0C\u6240\u4EE5\u8FD9\u6761\u89C4\u5219\u5C06\u5339\u914D\u5230\u6240\u6709\u8BF7\u6C42</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u4F46\u662F\u6B63\u5219\u548C\u6700\u957F\u5B57\u7B26\u4E32\u4F1A\u4F18\u5148\u5339\u914D</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration B </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location /documents/ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u5339\u914D\u4EFB\u4F55\u4EE5 /documents/ \u5F00\u5934\u7684\u5730\u5740\uFF0C\u5339\u914D\u7B26\u5408\u4EE5\u540E\uFF0C\u8FD8\u8981\u7EE7\u7EED\u5F80\u4E0B\u641C\u7D22</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u53EA\u6709\u540E\u9762\u7684\u6B63\u5219\u8868\u8FBE\u5F0F\u6CA1\u6709\u5339\u914D\u5230\u65F6\uFF0C\u8FD9\u4E00\u6761\u624D\u4F1A\u91C7\u7528\u8FD9\u4E00\u6761</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration C </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;"> /documents/Abc </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u5339\u914D\u4EFB\u4F55\u4EE5 /documents/Abc \u5F00\u5934\u7684\u5730\u5740\uFF0C\u5339\u914D\u7B26\u5408\u4EE5\u540E\uFF0C\u8FD8\u8981\u7EE7\u7EED\u5F80\u4E0B\u641C\u7D22</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u53EA\u6709\u540E\u9762\u7684\u6B63\u5219\u8868\u8FBE\u5F0F\u6CA1\u6709\u5339\u914D\u5230\u65F6\uFF0C\u8FD9\u4E00\u6761\u624D\u4F1A\u91C7\u7528\u8FD9\u4E00\u6761</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration CC </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location ^~ /images/ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u5339\u914D\u4EFB\u4F55\u4EE5 /images/ \u5F00\u5934\u7684\u5730\u5740\uFF0C\u5339\u914D\u7B26\u5408\u4EE5\u540E\uFF0C\u505C\u6B62\u5F80\u4E0B\u641C\u7D22\u6B63\u5219\uFF0C\u91C7\u7528\u8FD9\u4E00\u6761\u3002</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration D </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~*</span><span style="color:#A6ACCD;"> \\.</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">gif</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpg</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;">jpeg</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;">$ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u5339\u914D\u6240\u6709\u4EE5 gif,jpg\u6216jpeg \u7ED3\u5C3E\u7684\u8BF7\u6C42</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u7136\u800C\uFF0C\u6240\u6709\u8BF7\u6C42 /images/ \u4E0B\u7684\u56FE\u7247\u4F1A\u88AB config D \u5904\u7406\uFF0C\u56E0\u4E3A ^~ \u5230\u8FBE\u4E0D\u4E86\u8FD9\u4E00\u6761\u6B63\u5219</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration E </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location /images/ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u5B57\u7B26\u5339\u914D\u5230 /images/\uFF0C\u7EE7\u7EED\u5F80\u4E0B\uFF0C\u4F1A\u53D1\u73B0 ^~ \u5B58\u5728</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration F </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location /images/abc </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u6700\u957F\u5B57\u7B26\u5339\u914D\u5230 /images/abc\uFF0C\u7EE7\u7EED\u5F80\u4E0B\uFF0C\u4F1A\u53D1\u73B0 ^~ \u5B58\u5728</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># F\u4E0EG\u7684\u653E\u7F6E\u987A\u5E8F\u662F\u6CA1\u6709\u5173\u7CFB\u7684</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration G </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">location </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;"> /images/abc/ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">  </span><span style="color:#676E95;"># \u53EA\u6709\u53BB\u6389 config D \u624D\u6709\u6548\uFF1A\u5148\u6700\u957F\u5339\u914D config G \u5F00\u5934\u7684\u5730\u5740\uFF0C\u7EE7\u7EED\u5F80\u4E0B\u641C\u7D22\uFF0C\u5339\u914D\u5230\u8FD9\u4E00\u6761\u6B63\u5219\uFF0C\u91C7\u7528</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> configuration H </span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="\u5E38\u89C1\u95EE\u9898" tabindex="-1">\u5E38\u89C1\u95EE\u9898 <a class="header-anchor" href="#\u5E38\u89C1\u95EE\u9898" aria-hidden="true">#</a></h2><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#676E95;"># root \u548C alias\u7684\u533A\u522B\uFF1F</span></span>
<span class="line"><span style="color:#89DDFF;">**</span><span style="color:#A6ACCD;">root</span><span style="color:#89DDFF;">**</span></span>
<span class="line"><span style="color:#A6ACCD;">location /i/ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  root /data/w3</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">\u771F\u5B9E\u7684\u8DEF\u5F84\u662Froot\u6307\u5B9A\u7684\u503C\u52A0\u4E0Alocation\u6307\u5B9A\u7684\u503C,\u5373/data/w3/i/...</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">**</span><span style="color:#A6ACCD;">alias</span><span style="color:#89DDFF;">**</span></span>
<span class="line"><span style="color:#A6ACCD;">location /i/ </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#82AAFF;">alias</span><span style="color:#A6ACCD;"> /data/w3/</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">\u5728\u670D\u52A1\u5668\u67E5\u627E\u7684\u8D44\u6E90\u8DEF\u5F84\u662F\uFF1A /data/w3/...</span></span>
<span class="line"></span></code></pre></div>`,24),e=[o];function c(t,r,D,y,A,F){return a(),n("div",null,e)}const d=s(p,[["render",c]]);export{i as __pageData,d as default};
