# 模版字符串

模版字符串是es6引入的字符串操作规范，目的在于我们可以更加快速的书写多行字符串，基本的字符格式化和HTML转移等。

 <!--more-->
 
 ## 基本用法
 
 用反撇号代 `` ` `` 替单引号或者双引号：
 
 ```js
const message = `string template`;
console.log(message);
```

多行字符串。在之前多行书写的时候我们会在每行末尾加上``\``拼接字符串，或者要显示换行的时候加上换行符号 ``\n``：

```js
const msg = 'Hello \n\
word';
console.log(msg);
/*
Hello
world
*/
```

在模版字符串中我们直接换行写就可以了，在反撇号中间的换行符和空白字符都会被保留：

```js
const msg = `Hello
  world`;
console.log(msg);

/*
Hello
  world
*/
```

## 字符串占位符

模版字符串用``${js表达式}`` 的方式提供字符串占位，大括号中间允许任意js表达式：

```js
const name = 'wozien';
const msg = `Hello, I am ${name}`; // Hello, I am wozien
```

因为模版字符串也属于js表达式，所以占位符里面允许嵌套模版字符串：

```js
const arr = [1, 2, 3];
const html = `
<ul>
  ${arr.map(val => `<li>${val}<li>`).join('')}
</ul>  
`.trim();

console.log(html);

/*
<ul>
  <li>1<li><li>2<li><li>3<li>
</ul>
*/
```

上面的代码在一个模版字符串的占位符用 ``map`` 返回一个 ``li`` 字符串数组，最后 ``join`` 是因为模版字符串会转化不是字符串类型的数据，比如``[1,2,3]`` 显示为 ``1,2,3``。

## 标签模版

模版字符串可以在字符串前带上一个函数名作为标签，表示对后面紧跟的字符串进行处理，返回处理后结果。

```js
const name = 'wozien';
const age = 23;
const msg = tagFun`Hello, I am ${name}, my age is ${age}`;

function tagFun(literals, ...exps) {
  console.log(literals);  // [ 'Hello, I am ', ', my age is ', '' ]
  console.log(exps);   // [ 'wozien', 23 ]
}
```

可见，标签函数的第一个参数是占位符分割原字符串的数组结果，第二个参数是占位符的返回值结果数组。于是我们可以利用这两个数组进行拼接，模拟字符串模版的功能：

```js
function tagFun(literals, ...exps) {
  return literals.reduce((pre, cur, i) => {
    const value = exps[i - 1];
    return pre + value + cur;
  });
}

console.log(msg);  // Hello, I am wozien, my age is 23
```

## 应用

处理数组转换。在前面 ``map`` 生成的li数组中我们最后 ``join`` 了下，其实可以放在标签函数里面处理：

```js
function htmlTag(liters, ...exps) {
  let result = liters.reduce((pre, cur, i) => {
    let value = exps[i - 1];

    if (Array.isArray(value)) {
      value = value.join('');
    }

    return pre + value + cur;
  });

  return result.trim();
}

const arr = [1, 2, 3];
const html = htmlTag`
<ul>
  ${arr.map(val => `<li>${val}<li>`)}
</ul>`;

console.log(html);
```

有时候我们为了书写好看把字符串换行写，但实际是输出显示一行，我们可以写一个oneLine标签函数:

```js
function oneLine(liters, ...exps) {
  let result = liters.reduce((pre, cur, i) => {
    let value = exps[i - 1];
    return pre + value + cur;
  });

  // 正则替换掉每行前面的空字符
  result = result.replace(/(\n\s)*/g, '');
  return result.trim();
}

const fruits = oneLine`
  apple,
  peal,
  banane
`;

console.log(fruits);  // apple, peal, banane
```

在我们开发中，我们可以把标签函数封装起来，根据配置做不同的字符串处理。类似的工具包有[common-tags](https://github.com/declandewet/common-tags)。

## 参考

[ES6 系列之模板字符串](https://github.com/mqyqingfeng/Blog/issues/84)