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
const vueSource = {
  text: 'Vue 2.x',
  children: [
    { text: 'VirtualDOM的简单实现', link: '/source/vue/virtual-dom'},
    { text: 'new Vue 发生啥', link: '/source/vue/new-vue'},
    { text: '组件化', link: '/source/vue/component'},
    { text: '响应式原理', link: '/source/vue/reactive'},
    { text: '计算和监听属性', link: '/source/vue/watch-and-computed'},
    { text: '组件更新', link: '/source/vue/diff'},
    { text: 'Event', link: '/source/vue/event'},
    { text: '指令v-model', link: '/source/vue/v-model'},
    { text: '插槽 slot', link: '/source/vue/slot'},
    { text: 'keep-alive', link: '/source/vue/keep-alive'},
    { text: 'Vue Router', link: '/source/vue/vue-router'},
  ]
}

const share = [
  { text: '面试', link: '/share/interview' },
  { text: '网址社区', link: '/share/website' },
  { text: '电子书', link: '/share/books' }
]

const sidebar = {
  summary: {
    'js': [
      jsBaseBar,
      jsAdvanceBar,
      es6Bar
    ],
    'tools': [
      toolsBar
    ]
  } ,
  source: [
    vueSource
  ],
  share: share
}

module.exports = sidebar