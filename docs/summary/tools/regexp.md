# 正则表达式

## 字符速查

<table>
    <tbody>
    <tr>
        <th width="8%" style="font-size:18px">字符</th>
        <th width="92%" style="font-size:18px">描述</th>
    </tr>
    <tr>
        <th>\</th>
        <td>将下一个字符标记为一个特殊字符、或一个原义字符、或一个向后引用、或一个八进制转义符。例如，&ldquo;<code>n</code>”匹配字符“<code>n</code>”。“<code>\n</code>”匹配一个换行符。串行“<code>\\</code>”匹配“<code>\</code>”而“<code>\(</code>”则匹配“<code>(</code>”。</td>
    </tr>
    <tr>
        <th>^</th>
        <td>匹配输入字符串的开始位置。如果设置了RegExp对象的Multiline属性，^也匹配&ldquo;<code>\n</code>”或“<code>\r</code>”之后的位置。</td>
    </tr>
    <tr>
        <th>$</th>
        <td>匹配输入字符串的结束位置。如果设置了RegExp对象的Multiline属性，$也匹配&ldquo;<code>\n</code>”或“<code>\r</code>”之前的位置。</td>
    </tr>
    <tr>
        <th>*</th>
        <td>匹配前面的子表达式零次或多次。例如，zo*能匹配&ldquo;<code>z</code>”以及“<code>zoo</code>”。*等价于{0,}。</td>
    </tr>
    <tr>
        <th>+</th>
        <td>匹配前面的子表达式一次或多次。例如，&ldquo;<code>zo+</code>”能匹配“<code>zo</code>”以及“<code>zoo</code>”，但不能匹配“<code>z</code>”。+等价于{1,}。</td>
    </tr>
    <tr>
        <th>?</th>
        <td>匹配前面的子表达式零次或一次。例如，&ldquo;<code>do(es)?</code>”可以匹配“<code>does</code>”或“<code>does</code>”中的“<code>do</code>”。?等价于{0,1}。</td>
    </tr>
    <tr>
        <th>{<span style="font-family:Times New Roman; font-style:italic;">n</span>}</th>
        <td><span style="font-family:Times New Roman; font-style:italic;">n</span>是一个非负整数。匹配确定的<span style="font-family:Times New Roman; font-style:italic;">n</span>次。例如，&ldquo;<code>o{2}</code>”不能匹配“<code>Bob</code>”中的“<code>o</code>”，但是能匹配“<code>food</code>”中的两个o。</td>
    </tr>
    <tr>
        <th>{<span style="font-family:Times New Roman; font-style:italic;">n</span>,}</th>
        <td><span style="font-family:Times New Roman; font-style:italic;">n</span>是一个非负整数。至少匹配<span style="font-family:Times New Roman; font-style:italic;">n</span>次。例如，&ldquo;<code>o{2,}</code>”不能匹配“<code>Bob</code>”中的“<code>o</code>”，但能匹配“<code>foooood</code>”中的所有o。“<code>o{1,}</code>”等价于“<code>o+</code>”。“<code>o{0,}</code>”则等价于“<code>o*</code>”。</td>
    </tr>
    <tr>
        <th>{<span style="font-family:Times New Roman; font-style:italic;">n</span>,<span style="font-family:Times New Roman; font-style:italic;">m</span>}</th>
        <td><span style="font-family:Times New Roman; font-style:italic;">m</span>和<span style="font-family:Times New Roman; font-style:italic;">n</span>均为非负整数，其中<span style="font-family:Times New Roman; font-style:italic;">n</span>&lt;=<span style="font-family:Times New Roman; font-style:italic;">m</span>。最少匹配<span style="font-family:Times New Roman; font-style:italic;">n</span>次且最多匹配<span style="font-family:Times New Roman; font-style:italic;">m</span>次。例如，&ldquo;<code>o{1,3}</code>”将匹配“<code>fooooood</code>”中的前三个o。“<code>o{0,1}</code>”等价于“<code>o?</code>”。请注意在逗号和两个数之间不能有空格。</td>
    </tr>
    <tr>
        <th>?</th>
        <td>当该字符紧跟在任何一个其他限制符（*,+,?，{<span style="font-family:Times New Roman; font-style:italic;">n</span>}，{<span style="font-family:Times New Roman; font-style:italic;">n</span>,}，{<span style="font-family:Times New Roman; font-style:italic;">n</span>,<span style="font-family:Times New Roman; font-style:italic;">m</span>}）后面时，匹配模式是非贪婪的。非贪婪模式尽可能少的匹配所搜索的字符串，而默认的贪婪模式则尽可能多的匹配所搜索的字符串。例如，对于字符串&ldquo;<code>oooo</code>”，“<code>o+?</code>”将匹配单个“<code>o</code>”，而“<code>o+</code>”将匹配所有“<code>o</code>”。</td>
    </tr>
    <tr>
        <th>.</th>
        <td>匹配除&ldquo;<code>\</code><span style="font-family:Times New Roman; font-style:italic;"><code>n</code></span>”之外的任何单个字符。要匹配包括“<code>\</code><span style="font-family:Times New Roman; font-style:italic;"><code>n</code></span>”在内的任何字符，请使用像“<code>(.|\n)</code>”的模式。</td>
    </tr>
    <tr>
        <th>(pattern)</th>
        <td>匹配pattern并获取这一匹配。所获取的匹配可以从产生的Matches集合得到，在VBScript中使用SubMatches集合，在JScript中则使用$0&hellip;$9属性。要匹配圆括号字符，请使用&ldquo;<code>\(</code>”或“<code>\)</code>”。</td>
    </tr>
    <tr>
        <th>(?:pattern)</th>
        <td>匹配pattern但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用。这在使用或字符&ldquo;<code>(|)</code>”来组合一个模式的各个部分是很有用。例如“<code>industr(?:y|ies)</code>”就是一个比“<code>industry|industries</code>”更简略的表达式。</td>
    </tr>
    <tr>
        <th>(?=pattern)</th>
        <td>正向肯定预查，在任何匹配pattern的字符串开始处匹配查找字符串。这是一个非获取匹配，也就是说，该匹配不需要获取供以后使用。例如，&ldquo;<code>Windows(?=95|98|NT|2000)</code>”能匹配“<code>Windows2000</code>”中的“<code>Windows</code>”，但不能匹配“<code>Windows3.1</code>”中的“<code>Windows</code>”。预查不消耗字符，也就是说，在一个匹配发生后，在最后一次匹配之后立即开始下一次匹配的搜索，而不是从包含预查的字符之后开始。</td>
    </tr>
    <tr>
        <th>(?!pattern)</th>
        <td>正向否定预查，在任何不匹配pattern的字符串开始处匹配查找字符串。这是一个非获取匹配，也就是说，该匹配不需要获取供以后使用。例如&ldquo;<code>Windows(?!95|98|NT|2000)</code>”能匹配“<code>Windows3.1</code>”中的“<code>Windows</code>”，但不能匹配“<code>Windows2000</code>”中的“<code>Windows</code>”。预查不消耗字符，也就是说，在一个匹配发生后，在最后一次匹配之后立即开始下一次匹配的搜索，而不是从包含预查的字符之后开始</td>
    </tr>
    <tr>
        <th>(?&lt;=pattern)</th>
        <td>反向肯定预查，与正向肯定预查类拟，只是方向相反。例如，&ldquo;<code>(?&lt;=95|98|NT|2000)Windows</code>”能匹配“<code>2000Windows</code>”中的“<code>Windows</code>”，但不能匹配“<code>3.1Windows</code>”中的“<code>Windows</code>”。</td>
    </tr>
    <tr>
        <th>(?&lt;!pattern)</th>
        <td>反向否定预查，与正向否定预查类拟，只是方向相反。例如&ldquo;<code>(?&lt;!95|98|NT|2000)Windows</code>”能匹配“<code>3.1Windows</code>”中的“<code>Windows</code>”，但不能匹配“<code>2000Windows</code>”中的“<code>Windows</code>”。</td>
    </tr>
    <tr>
        <th>x|y</th>
        <td>匹配x或y。例如，&ldquo;<code>z|food</code>”能匹配“<code>z</code>”或“<code>food</code>”。“<code>(z|f)ood</code>”则匹配“<code>zood</code>”或“<code>food</code>”。</td>
    </tr>
    <tr>
        <th>[xyz]</th>
        <td>字符集合。匹配所包含的任意一个字符。例如，&ldquo;<code>[abc]</code>”可以匹配“<code>plain</code>”中的“<code>a</code>”。</td>
    </tr>
    <tr>
        <th>[^xyz]</th>
        <td>负值字符集合。匹配未包含的任意字符。例如，&ldquo;<code>[^abc]</code>”可以匹配“<code>plain</code>”中的“<code>p</code>”。</td>
    </tr>
    <tr>
        <th>[a-z]</th>
        <td>字符范围。匹配指定范围内的任意字符。例如，&ldquo;<code>[a-z]</code>”可以匹配“<code>a</code>”到“<code>z</code>”范围内的任意小写字母字符。</td>
    </tr>
    <tr>
        <th>[^a-z]</th>
        <td>负值字符范围。匹配任何不在指定范围内的任意字符。例如，&ldquo;<code>[^a-z]</code>”可以匹配任何不在“<code>a</code>”到“<code>z</code>”范围内的任意字符。</td>
    </tr>
    <tr>
        <th>\b</th>
        <td>匹配一个单词边界，也就是指单词和空格间的位置。例如，&ldquo;<code>er\b</code>”可以匹配“<code>never</code>”中的“<code>er</code>”，但不能匹配“<code>verb</code>”中的“<code>er</code>”。</td>
    </tr>
    <tr>
        <th>\B</th>
        <td>匹配非单词边界。&ldquo;<code>er\B</code>”能匹配“<code>verb</code>”中的“<code>er</code>”，但不能匹配“<code>never</code>”中的“<code>er</code>”。</td>
    </tr>
    <tr>
        <th>\cx</th>
        <td>匹配由x指明的控制字符。例如，\cM匹配一个Control-M或回车符。x的值必须为A-Z或a-z之一。否则，将c视为一个原义的&ldquo;<code>c</code>”字符。</td>
    </tr>
    <tr>
        <th>\d</th>
        <td>匹配一个数字字符。等价于[0-9]。</td>
    </tr>
    <tr>
        <th>\D</th>
        <td>匹配一个非数字字符。等价于[^0-9]。</td>
    </tr>
    <tr>
        <th>\f</th>
        <td>匹配一个换页符。等价于\x0c和\cL。</td>
    </tr>
    <tr>
        <th>\n</th>
        <td>匹配一个换行符。等价于\x0a和\cJ。</td>
    </tr>
    <tr>
        <th>\r</th>
        <td>匹配一个回车符。等价于\x0d和\cM。</td>
    </tr>
    <tr>
        <th>\s</th>
        <td>匹配任何空白字符，包括空格、制表符、换页符等等。等价于[ \f\n\r\t\v]。</td>
    </tr>
    <tr>
        <th>\S</th>
        <td>匹配任何非空白字符。等价于[^ \f\n\r\t\v]。</td>
    </tr>
    <tr>
        <th>\t</th>
        <td>匹配一个制表符。等价于\x09和\cI。</td>
    </tr>
    <tr>
        <th>\v</th>
        <td>匹配一个垂直制表符。等价于\x0b和\cK。</td>
    </tr>
    <tr>
        <th>\w</th>
        <td>匹配包括下划线的任何单词字符。等价于&ldquo;<code>[A-Za-z0-9_]</code>”。</td>
    </tr>
    <tr>
        <th>\W</th>
        <td>匹配任何非单词字符。等价于&ldquo;<code>[^A-Za-z0-9_]</code>”。</td>
    </tr>
    <tr>
        <th>\x<span style="font-family:Times New Roman; font-style:italic;">n</span></th>
        <td>匹配<span style="font-family:Times New Roman; font-style:italic;">n</span>，其中<span style="font-family:Times New Roman; font-style:italic;">n</span>为十六进制转义值。十六进制转义值必须为确定的两个数字长。例如，&ldquo;<code>\x41</code>”匹配“<code>A</code>”。“<code>\x041</code>”则等价于“<code>\x04&amp;1</code>”。正则表达式中可以使用ASCII编码。.</td>
    </tr>
    <tr>
        <th>\<span style="font-family:Times New Roman; font-style:italic;">num</span></th>
        <td>匹配<span style="font-family:Times New Roman; font-style:italic;">num</span>，其中<span style="font-family:Times New Roman; font-style:italic;">num</span>是一个正整数。对所获取的匹配的引用。例如，&ldquo;<code>(.)\1</code>”匹配两个连续的相同字符。</td>
    </tr>
    <tr>
        <th>\<span style="font-family:Times New Roman; font-style:italic;">n</span></th>
        <td>标识一个八进制转义值或一个向后引用。如果\<span style="font-family:Times New Roman; font-style:italic;">n</span>之前至少<span style="font-family:Times New Roman; font-style:italic;">n</span>个获取的子表达式，则<span style="font-family:Times New Roman; font-style:italic;">n</span>为向后引用。否则，如果<span style="font-family:Times New Roman; font-style:italic;">n</span>为八进制数字（0-7），则<span style="font-family:Times New Roman; font-style:italic;">n</span>为一个八进制转义值。</td>
    </tr>
    <tr>
        <th>\<span style="font-family:Times New Roman; font-style:italic;">nm</span></th>
        <td>标识一个八进制转义值或一个向后引用。如果\<span style="font-family:Times New Roman; font-style:italic;">nm</span>之前至少有<span style="font-family:Times New Roman; font-style:italic;">nm</span>个获得子表达式，则<span style="font-family:Times New Roman; font-style:italic;">nm</span>为向后引用。如果\<span style="font-family:Times New Roman; font-style:italic;">nm</span>之前至少有<span style="font-family:Times New Roman; font-style:italic;">n</span>个获取，则<span style="font-family:Times New Roman; font-style:italic;">n</span>为一个后跟文字<span style="font-family:Times New Roman; font-style:italic;">m</span>的向后引用。如果前面的条件都不满足，若<span style="font-family:Times New Roman; font-style:italic;">n</span>和<span style="font-family:Times New Roman; font-style:italic;">m</span>均为八进制数字（0-7），则\<span style="font-family:Times New Roman; font-style:italic;">nm</span>将匹配八进制转义值<span style="font-family:Times New Roman; font-style:italic;">nm</span>。</td>
    </tr>
    <tr>
        <th>\<span style="font-family:Times New Roman; font-style:italic;">nml</span></th>
        <td>如果<span style="font-family:Times New Roman; font-style:italic;">n</span>为八进制数字（0-3），且<span style="font-family:Times New Roman; font-style:italic;">m和l</span>均为八进制数字（0-7），则匹配八进制转义值<span style="font-family:Times New Roman; font-style:italic;">nm</span>l。</td>
    </tr>
    <tr>
        <th>\u<span style="font-family:Times New Roman; font-style:italic;">n</span></th>
        <td>匹配<span style="font-family:Times New Roman; font-style:italic;">n</span>，其中<span style="font-family:Times New Roman; font-style:italic;">n</span>是一个用四个十六进制数字表示的Unicode字符。例如，\u00A9匹配版权符号（&copy;）。</td>
    </tr>
    <tr>
        <th>\u4e00-\u9fa5</th>
        <td>匹配所有中文字符</td>    
    </tr>    
    </tbody>
</table>

## 常用表达式

手机号, 只要是13,14,15,16,17,18,19开头即可

```js
/^(?:(?:\+|00)86)?1[3-9]\d{9}$/
```

email(支持中文邮箱)

```js
/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
```

必须带端口号的网址(或ip)
```js
/^((ht|f)tps?:\/\/)?[\w-]+(\.[\w-]+)+:\d{1,5}\/?$/
```

数字/货币金额（支持负数、千分位分隔符）
```js
/^-?\d+(,\d{3})*(\.\d{1,2})?$/
```

密码强度校验，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
```js
/^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
```

##  参考
[https://github.com/ziishaned/learn-regex/blob/master/translations/README-cn.md](https://github.com/ziishaned/learn-regex/blob/master/translations/README-cn.md)
[https://any86.github.io/any-rule/](https://any86.github.io/any-rule/)