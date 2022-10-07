import{_ as s,c as n,o as a,a as l}from"./app.a7159b07.js";const i=JSON.parse('{"title":"let \u548C const","description":"","frontmatter":{},"headers":[{"level":2,"title":"\u53D8\u91CF\u63D0\u5347","slug":"\u53D8\u91CF\u63D0\u5347"},{"level":2,"title":"let\u58F0\u660E","slug":"let\u58F0\u660E"},{"level":2,"title":"const\u58F0\u660E","slug":"const\u58F0\u660E"},{"level":2,"title":"\u4E34\u65F6\u6B7B\u533A","slug":"\u4E34\u65F6\u6B7B\u533A"},{"level":2,"title":"\u5728\u5FAA\u73AF\u4E2D\u7684\u533A\u522B","slug":"\u5728\u5FAA\u73AF\u4E2D\u7684\u533A\u522B"},{"level":2,"title":"\u5728\u5168\u5C40\u4E2D\u7684\u7ED1\u5B9A","slug":"\u5728\u5168\u5C40\u4E2D\u7684\u7ED1\u5B9A"},{"level":2,"title":"\u5C0F\u7ED3","slug":"\u5C0F\u7ED3"}],"relativePath":"summary/es6/let-and-const.md"}'),p={name:"summary/es6/let-and-const.md"},o=l(`<h1 id="let-\u548C-const" tabindex="-1">let \u548C const <a class="header-anchor" href="#let-\u548C-const" aria-hidden="true">#</a></h1><p>\u6211\u4EEC\u77E5\u9053es5\u4E2D <code>var</code> \u58F0\u660E\u53D8\u91CF\u662F\u4F5C\u7528\u4E8E\u5728\u5168\u5C40\u6216\u51FD\u6570\u4F5C\u7528\u57DF\uFF0C\u5E76\u4E14\u5168\u5C40\u58F0\u660E\u7684\u53D8\u91CF\u8FD8\u4F1A\u4F5C\u4E3A <code>window</code> \u5BF9\u8C61\u7684\u5C5E\u6027\u3002\u8FD9\u6837\u4F1A\u589E\u52A0\u7A0B\u5E8F\u9519\u8BEF\u7684\u4EA7\u751F\u548C\u4E0D\u53EF\u63A7\u3002</p><h2 id="\u53D8\u91CF\u63D0\u5347" tabindex="-1">\u53D8\u91CF\u63D0\u5347 <a class="header-anchor" href="#\u53D8\u91CF\u63D0\u5347" aria-hidden="true">#</a></h2><p>\u5728\u5168\u5C40\u6216\u8005\u51FD\u6570\u4F5C\u7528\u5185\u7528 <code>var</code> \u58F0\u660E\u7684\u53D8\u91CF\uFF0C\u5728js\u9884\u7F16\u8BD1\u9636\u6BB5\u4F1A\u63D0\u5347\u5230\u5F53\u524D\u4F5C\u7528\u57DF\u7684\u9876\u90E8\uFF0C\u8FD9\u5C31\u662F\u53D8\u91CF\u63D0\u5347\u3002\u5982\u4E0B\u4EE3\u7801\uFF1A</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">getValue</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">condition</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">condition</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#C792EA;">var</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">red</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// undefined</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;">  </span><span style="color:#676E95;">// undefined</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u4EE5\u4E0A\u4EE3\u7801\u76F8\u5F53\u4E8E\u628A\u53D8\u91CFvalue\u653E\u5728\u5F53\u524D\u4F5C\u7528\u57DF\u5148\u58F0\u660E\uFF0C\u6240\u4EE5\u624D\u80FD\u5728if\u5757\u5916\u548Celse\u5757\u8BBF\u95EE\u5230\uFF0C\u90FD\u4F1A\u8F93\u51FA <code>undefined</code>\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">getValue</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">condition</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">var</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">condition</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">red</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// undefined</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;">  </span><span style="color:#676E95;">// undefined</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="let\u58F0\u660E" tabindex="-1">let\u58F0\u660E <a class="header-anchor" href="#let\u58F0\u660E" aria-hidden="true">#</a></h2><p>\u4ECE\u4E0A\u9762\u7684\u53EF\u4EE5\u770B\u51FA <code>var</code> \u58F0\u660E\u7684\u53D8\u91CF\u6CA1\u6709\u5757\u7EA7\u4F5C\u7528\u57DF\u7684\u6982\u5FF5\uFF0C\u6240\u4EE5es6\u5F15\u5165\u4E86<code>let</code> \u58F0\u660E\uFF0C\u5E76\u7ED1\u5B9A\u5728\u5F53\u524D\u7684\u5757\u4F5C\u7528\u57DF\uFF0C\u5757\u4F5C\u7528\u57DF\u5916\u8BBF\u95EE\u62A5\u9519\uFF0C\u5982\u4E0B\uFF1A</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">function</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">getValue</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">condition</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">if</span><span style="color:#F07178;"> (</span><span style="color:#A6ACCD;">condition</span><span style="color:#F07178;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">red</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">else</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// ReferenceError: value is not defined</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// ReferenceError: value is not defined</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u7981\u6B62\u91CD\u590D\u58F0\u660E\u3002\u5728\u540C\u4E00\u4E2A\u5757\u4E2D\u4E0D\u80FD\u7528 <code>let</code> \u58F0\u660E\u5DF2\u7ECF\u5B58\u5728\u7684\u6807\u8BC6\u7B26\uFF0C\u5426\u5219\u4F1A\u62A5\u9519\u3002\u5982\u679C\u662F\u5D4C\u5957\u7684\u4F5C\u7528\u57DF\u4E2D\u91CD\u590D\u58F0\u660E\uFF0C\u5219\u4E0D\u4F1A\u62A5\u9519\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">var</span><span style="color:#A6ACCD;"> count </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">30</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> count </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">30</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;">// SyntaxError: Identifier &#39;count&#39; has already been declared</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">if</span><span style="color:#A6ACCD;"> (</span><span style="color:#FF9CAC;">true</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">count</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#F78C6C;">30</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;">  </span><span style="color:#676E95;">// \u4E0D\u4F1A\u62A5\u9519</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="const\u58F0\u660E" tabindex="-1">const\u58F0\u660E <a class="header-anchor" href="#const\u58F0\u660E" aria-hidden="true">#</a></h2><p>\u5728es6\u5F15\u5165<code>const</code> \u6765\u8FDB\u884C\u5E38\u91CF\u7684\u58F0\u660E\u3002\u4ED6\u548C\u524D\u9762\u7684 <code>let</code> \u4E00\u6837\u6709\u5757\u4F5C\u7528\u57DF\u7ED1\u5B9A\u548C\u4E0D\u8BB8\u91CD\u590D\u58F0\u660E\u7684\u7279\u6027\u3002\u4F46\u662F<code>const</code> \u5FC5\u987B\u8981\u5728\u58F0\u660E\u7684\u9636\u6BB5\u8FDB\u884C\u521D\u59CB\u5316\uFF0C\u800C<code>let</code> \u4E0D\u7528\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> count</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;">// \u4E0D\u4F1A\u62A5\u9519</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> count</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;">//SyntaxError: Missing initializer in const declaration</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> count </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">30</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;">// \u6B63\u786E\u58F0\u660E</span></span>
<span class="line"></span></code></pre></div><p><code>const</code> \u58F0\u660E\u7684\u53D8\u91CF\u4E0D\u80FD\u518D\u8D4B\u503C\u3002\u5982\u679C\u53D8\u91CF\u662F\u5F15\u7528\u7C7B\u578B\uFF0C\u53EF\u4EE5\u4FEE\u6539\u5BF9\u8C61\u7684\u5C5E\u6027\u503C\uFF0C\u4F46\u4E0D\u53EF\u4EE5\u91CD\u65B0\u4FEE\u6539\u7ED1\u5B9A\u7684\u5BF9\u8C61\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> count </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">20</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">count </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">30</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;">// TypeError: Assignment to constant variable.</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> obj </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{};</span></span>
<span class="line"><span style="color:#A6ACCD;">obj</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">name </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">wozien</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span></code></pre></div><h2 id="\u4E34\u65F6\u6B7B\u533A" tabindex="-1">\u4E34\u65F6\u6B7B\u533A <a class="header-anchor" href="#\u4E34\u65F6\u6B7B\u533A" aria-hidden="true">#</a></h2><p>\u7531\u4E8E<code>let</code> \u4E0E <code>const</code> \u4E0D\u5B58\u5728\u53D8\u91CF\u63D0\u5347\uFF0C\u6240\u4EE5\u5728\u58F0\u660E\u524D\u4F7F\u7528\u8BE5\u53D8\u91CF\u4F1A\u62A5\u9519\u3002\u56E0\u4E3A\u5728\u58F0\u660E\u524D\uFF0C\u8BE5\u53D8\u91CF\u5B58\u5728\u4E8E\u6240\u8C13\u7684\u4E34\u65F6\u6B7B\u533A(TDZ)\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#89DDFF;">if</span><span style="color:#A6ACCD;"> (</span><span style="color:#FF9CAC;">true</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">typeof</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">red</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span><span style="color:#F07178;"> </span><span style="color:#676E95;">// ReferenceError: value is not defined</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u5F53\u53D8\u91CF\u58F0\u660E\u540E\uFF0C\u5C31\u4F1A\u4ECE\u4E34\u65F6\u6B7B\u533A\u79FB\u51FA\uFF0C\u540E\u7EED\u53EF\u6B63\u5E38\u8BBF\u95EE\u3002\u6CE8\u610F\u7684\u662F\uFF0CTDZ\u662F\u9488\u5BF9\u5F53\u524D\u7684\u5757\u4F5C\u7528\u57DF\u800C\u8A00\uFF0C\u6240\u4EE5\u5982\u4E0B\u53EF\u4EE5\u6B63\u786E\u8FD0\u884C\uFF1A</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">typeof</span><span style="color:#A6ACCD;"> value)</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// undefiend</span></span>
<span class="line"><span style="color:#89DDFF;">if</span><span style="color:#A6ACCD;"> (</span><span style="color:#FF9CAC;">true</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#C792EA;">let</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">=</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">red</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="\u5728\u5FAA\u73AF\u4E2D\u7684\u533A\u522B" tabindex="-1">\u5728\u5FAA\u73AF\u4E2D\u7684\u533A\u522B <a class="header-anchor" href="#\u5728\u5FAA\u73AF\u4E2D\u7684\u533A\u522B" aria-hidden="true">#</a></h2><p>\u5728 <code>var</code> \u58F0\u660E\u7684\u5FAA\u73AF\u53D8\u91CF\uFF0C\u4F1A\u5728\u5FAA\u73AF\u540E\u5916\u90E8\u53EF\u6B63\u5E38\u8BBF\u95EE\uFF0C\u5E76\u4E14\u503C\u4E3A\u8DF3\u51FA\u5FAA\u73AF\u7684\u503C\u3002<code>let</code> \u58F0\u660E\u7684\u53D8\u91CF\u5219\u53EA\u5728\u5FAA\u73AF\u4F53\u5185\u6709\u6548\uFF0C\u5982\u4E0B\uFF1A</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#89DDFF;">for</span><span style="color:#A6ACCD;"> (</span><span style="color:#C792EA;">var</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">5</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i</span><span style="color:#89DDFF;">++</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{}</span></span>
<span class="line"><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#A6ACCD;">(i)</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// 5</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">for</span><span style="color:#A6ACCD;"> (</span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">5</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i</span><span style="color:#89DDFF;">++</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{}</span></span>
<span class="line"><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#A6ACCD;">(i)</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// ReferenceError: i is not defined</span></span>
<span class="line"></span></code></pre></div><p>\u5728\u5229\u7528 <code>var</code> \u58F0\u660E\u7684\u5FAA\u73AF\u4E2D\u521B\u5EFA\u51FD\u6570\u4F1A\u53D8\u5F97\u5F88\u8270\u96BE\uFF0C\u56E0\u4E3A\u51FD\u6570\u6267\u884C\u7684\u65F6\u5019\u662F\u8FED\u4EE3\u5B8C\u7684\u6700\u7EC8\uFF0C\u5982\u4E0B\uFF1A</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> func </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> []</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">for</span><span style="color:#A6ACCD;"> (</span><span style="color:#C792EA;">var</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i</span><span style="color:#89DDFF;">++</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">forEach</span><span style="color:#A6ACCD;">(</span><span style="color:#A6ACCD;">func</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">func</span><span style="color:#A6ACCD;">())</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// 2 2 2</span></span>
<span class="line"></span></code></pre></div><p>\u6211\u4EEC\u53EF\u4EE5\u5229\u7528\u7ACB\u5373\u6267\u884C\u51FD\u6570(IIFE)\u89E3\u51B3\u8FD9\u4E2A\u95EE\u9898\uFF0C\u8BA9\u6BCF\u4E2A\u51FD\u6570\u6700\u7EC8\u4FDD\u5B58\u7684\u662F\u8FED\u4EE3\u8FC7\u7A0B\u4E2D\u53D8\u91CF\u7684\u526F\u672C\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#89DDFF;">for</span><span style="color:#A6ACCD;"> (</span><span style="color:#C792EA;">var</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i</span><span style="color:#89DDFF;">++</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  (</span><span style="color:#C792EA;">function</span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#89DDFF;">)</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">    </span><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">value</span><span style="color:#F07178;">))</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#89DDFF;">}</span><span style="color:#F07178;">)(</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;">)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><p>\u5728es6\u4E2D\u5FAA\u73AF\u91CC\u9762 <code>let</code> \u58F0\u660E\u53EF\u4EE5\u7528\u6765\u7B80\u5316\u4E0A\u9762IIFE\u7684\u5B9E\u73B0\u8FC7\u7A0B\uFF0C\u4ED6\u4F1A\u5728\u6BCF\u6B21\u8FED\u4EE3\u8FC7\u7A0B\u4E2D\u91CD\u65B0\u58F0\u660E\u4E00\u4E2A\u540C\u540D\u53D8\u91CFi\uFF0C\u503C\u4E3A\u5F53\u524D\u7684\u8FED\u4EE3i\u7684\u503C\uFF0C\u6240\u4EE5\u5FAA\u73AF\u4F53\u5185\u7684\u51FD\u6570\u4F7F\u7528\u7684\u90FD\u662Fi\u503C\u7684\u526F\u672C\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#89DDFF;">for</span><span style="color:#A6ACCD;"> (</span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i </span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> i</span><span style="color:#89DDFF;">++</span><span style="color:#A6ACCD;">) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">i</span><span style="color:#F07178;">))</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">forEach</span><span style="color:#A6ACCD;">(</span><span style="color:#A6ACCD;">func</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">func</span><span style="color:#A6ACCD;">())</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// 0 1 2</span></span>
<span class="line"></span></code></pre></div><p>\u5982\u679C\u628A <code>let</code> \u6539\u6210 <code>const</code>, \u5728\u7B2C\u4E8C\u6B21\u8FED\u4EE3\u7684\u65F6\u5019\u4F1A\u62A5\u9519\uFF0C\u56E0\u4E3A <code>const</code> \u4E0D\u8BB8\u91CD\u65B0\u8D4B\u503C\u3002\u800C\u5BF9\u4E8E <code>for-in</code> \u548C <code>for-of</code> \u5FAA\u73AF\u4E24\u8005\u90FD\u53EF\u4EE5\u6B63\u5E38\u7684\u8FD0\u884C\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> obj </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">a</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">b</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#F07178;">c</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span></span>
<span class="line"><span style="color:#89DDFF;">};</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> func </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> []</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">for</span><span style="color:#A6ACCD;"> (</span><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> key </span><span style="color:#89DDFF;">in</span><span style="color:#A6ACCD;"> obj) </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#F07178;">  </span><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">push</span><span style="color:#F07178;">(</span><span style="color:#89DDFF;">()</span><span style="color:#F07178;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#F07178;">(</span><span style="color:#A6ACCD;">key</span><span style="color:#F07178;">))</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">func</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">forEach</span><span style="color:#A6ACCD;">(</span><span style="color:#A6ACCD;">func</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">func</span><span style="color:#A6ACCD;">())</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;">// a b c</span></span>
<span class="line"></span></code></pre></div><p>\u5982\u679C\u628A<code>let</code> \u66FF\u6362\u6210 <code>var</code> \uFF0C\u5C06\u4F1A\u8F93\u51FA3\u4E2Ac\u3002\u56E0\u4E3A <code>for-in</code> \u548C <code>for-of</code> \u6BCF\u6B21\u90FD\u53EA\u4F1A\u91CD\u65B0\u58F0\u660E\u4E00\u4E2A\u65B0\u7684\u526F\u672Ckey\u3002</p><h2 id="\u5728\u5168\u5C40\u4E2D\u7684\u7ED1\u5B9A" tabindex="-1">\u5728\u5168\u5C40\u4E2D\u7684\u7ED1\u5B9A <a class="header-anchor" href="#\u5728\u5168\u5C40\u4E2D\u7684\u7ED1\u5B9A" aria-hidden="true">#</a></h2><p>\u5229\u7528 <code>var</code> \u5728\u5168\u5C40\u58F0\u660E\u53D8\u91CF\uFF0C\u4F1A\u4F5C\u4E3Awindow\u5BF9\u8C61\u7684\u4E00\u4E2A\u5C5E\u6027\u5B58\u5728\uFF0C\u800C <code>let</code> \u548C <code>const</code> \u5219\u4E0D\u4F1A\u3002</p><div class="language-js"><button class="copy"></button><span class="lang">js</span><pre><code><span class="line"><span style="color:#C792EA;">var</span><span style="color:#A6ACCD;"> a </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#C792EA;">let</span><span style="color:#A6ACCD;"> b </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">2</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> c </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#A6ACCD;">(window</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">a)</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// 1</span></span>
<span class="line"><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#A6ACCD;">(window</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">b)</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// undefined</span></span>
<span class="line"><span style="color:#A6ACCD;">console</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">log</span><span style="color:#A6ACCD;">(window</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">c)</span><span style="color:#89DDFF;">;</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;">// undefined</span></span>
<span class="line"></span></code></pre></div><h2 id="\u5C0F\u7ED3" tabindex="-1">\u5C0F\u7ED3 <a class="header-anchor" href="#\u5C0F\u7ED3" aria-hidden="true">#</a></h2><p>es6\u4E2D\u7684<code>let</code> \u548C <code>const</code> \u4E0E <code>var</code> \u533A\u522B\u5982\u4E0B\uFF1A</p><ul><li>\u7ED1\u5B9A\u5757\u4F5C\u7528\u57DF\uFF0C\u4E0D\u5B58\u5728\u53D8\u91CF\u63D0\u5347</li><li>\u4E0D\u5141\u8BB8\u91CD\u590D\u5B9A\u4E49</li><li>\u58F0\u660E\u524D\u4E0D\u5141\u8BB8\u4F7F\u7528\u53D8\u91CF</li><li><code>for</code> \u5FAA\u73AF\u4E2D\u6BCF\u6B21\u521B\u5EFA\u65B0\u7684\u526F\u672C</li><li>\u5168\u5C40\u58F0\u660E\u4E0D\u4F5C\u4E3A <code>window</code> \u5C5E\u6027</li></ul><p>\u5728\u6211\u4EEC\u5E73\u65F6\u7684\u5F00\u53D1\u4E2D\uFF0C\u53EF\u4EE5\u9ED8\u8BA4\u4F7F\u7528<code>const</code>\u3002\u5728\u786E\u8BA4\u9700\u8981\u6539\u53D8\u53D8\u91CF\u7684\u503C\u65F6\u624D\u4F7F\u7528<code>let</code>\uFF0C\u53EF\u4EE5\u4E00\u5B9A\u7A0B\u5E8F\u4E0A\u9632\u6B62\u4EE3\u7801\u7684\u9519\u8BEF\u4EA7\u751F\u3002</p>`,41),e=[o];function c(t,r,y,F,D,A){return a(),n("div",null,e)}const d=s(p,[["render",c]]);export{i as __pageData,d as default};
