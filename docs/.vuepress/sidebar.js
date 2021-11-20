//  JS 基础
const jsBaseBar = {
  text: 'JS 基础',
  children: [
    '/summary/js-base/function-context',
    '/summary/js-base/scope',
    '/summary/js-base/closure',
    '/summary/js-base/prototype',
    '/summary/js-base/event',
    '/summary/js-base/dom',
    '/summary/js-base/ajax',
    '/summary/js-base/memory'
  ]
}

// JS 进阶
const jsAdvanceBar = {
  text: 'JS 进阶',
  children: [
    '/summary/js-advance/debounce-and-throttle',
    '/summary/js-advance/event-loop',
    '/summary/js-advance/promise',
    '/summary/js-advance/curry',
    '/summary/js-advance/fucking-source',
  ]
}

// es6+
const es6Bar = {
  text: 'ES6+',
  children: [
    { text: 'let 和 const', link: '/summary/es6/let-and-const'},
    { text: '模板字符串', link: '/summary/es6/pattern-string'},
    { text: '函数扩展', link: '/summary/es6/function'},
    { text: '对象扩展', link: '/summary/es6/object'},
    { text: '对象和数组解构', link: '/summary/es6/destruction'},
    { text: 'Symbol 类型', link: '/summary/es6/symbol'},
    { text: '认识Set和Map', link: '/summary/es6/set-and-map'},
    { text: '迭代器Iterator', link: '/summary/es6/iterator'},
    { text: '生成器Generator', link: '/summary/es6/generator'},
    { text: 'Promise与异步编程', link: '/summary/es6/promise'},
    { text: 'async 函数', link: '/summary/es6/async'},
    { text: '代理 Proxy', link: '/summary/es6/proxy'},
  ]
}

// 浏览器
const browser = {
  text: '浏览器相关',
  children: [
    '/summary/browser/render',
    '/summary/browser/perf',
    '/summary/browser/http',
    '/summary/browser/cache',
    '/summary/browser/security',
    '/summary/browser/v8',
  ]
}

// 工具 tool
const toolsBar = {
  text: '效能工具',
  children: [
    '/summary/tools/docker',
    '/summary/tools/git',
    '/summary/tools/nginx',
    '/summary/tools/regexp',
  ]
}

// 源码
const vueSource = [{
  text: 'Vue 2.x',
  children: [
    '/source/vue/virtual-dom',
    '/source/vue/new-vue',
    '/source/vue/component',
    '/source/vue/reactive',
    '/source/vue/watch-and-computed',
    '/source/vue/diff',
    '/source/vue/event',
    '/source/vue/v-model',
    '/source/vue/slot',
    '/source/vue/keep-alive',
    '/source/vue/vue-router',
  ]
}, {
  text: 'Vue 3.x',
  children: []
}]

const reactSource = [{
  text: 'React 17.x',
  children: [
    '/source/react/'
  ]
}]

const share = [
  { text: '面试', link: '/share/interview' },
  { text: '网址社区', link: '/share/website' },
  { text: '电子书', link: '/share/books' },
  { 
    text: '读书笔记',
    children: [
      '/share/book/node',
      '/share/book/webpack'
    ]
  }
]

const sidebar = {
  summary: {
    'js': [
      jsBaseBar,
      jsAdvanceBar,
      es6Bar
    ],
    'browser': [
      browser
    ],
    'tools': [
      toolsBar
    ]
  },
  source: {
    'vue': vueSource,
    'react': reactSource
  },
  share: share
}

module.exports = sidebar