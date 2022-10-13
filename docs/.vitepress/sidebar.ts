import type { DefaultTheme } from 'vitepress';

//  JS 基础
const jsBaseBar: DefaultTheme.SidebarItem = {
  text: 'JS 基础',
  items: [
    { text: '函数上下文', link: '/summary/js-base/function-context' },
    { text: '作用域', link: '/summary/js-base/scope' },
    { text: '闭包', link: '/summary/js-base/closure' },
    { text: '原型链', link: '/summary/js-base/prototype' },
    { text: '内存管理', link: '/summary/js-base/memory' },
  ]
}

// JS 进阶
const jsAdvanceBar: DefaultTheme.SidebarItem = {
  text: 'JS 进阶',
  items: [
    { text: '防抖和节流', link: '/summary/js-advance/debounce-and-throttle' },
    { text: '事件循环', link: '/summary/js-advance/event-loop' },
    { text: '实现 Promise', link: '/summary/js-advance/promise' },
    { text: '函数柯里化', link: '/summary/js-advance/curry' },
    { text: '手写函数源码', link: '/summary/js-advance/fucking-source' },
  ]
}

// es6+
const es6Bar: DefaultTheme.SidebarItem = {
  text: 'ES6+',
  items: [
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
const browser: DefaultTheme.SidebarItem = {
  text: '浏览器相关',
  items: [
    { text: '渲染原理', link: '/summary/browser/render'},
    { text: '性能优化', link: '/summary/browser/perf'},
    { text: 'HTTP', link: '/summary/browser/http'},
    { text: '缓存机制', link: '/summary/browser/cache'},
    { text: '浏览器安全', link: '/summary/browser/security'},
    { text: 'v8 工作原理', link: '/summary/browser/v8'},
  ]
}

// 工具 tool
const toolsBar: DefaultTheme.SidebarItem = {
  text: '效能工具',
  items: [
    { text: 'Docker 基础', link: '/summary/tools/docker'},
    { text: 'Git 速查', link: '/summary/tools/git'},
    { text: 'Nginx 速查', link: '/summary/tools/nginx'},
    { text: '正则表达式', link: '/summary/tools/regexp'},
  ]
}

// Vue 源码
const vueSource: DefaultTheme.SidebarGroup[] = [{
  text: 'Vue2 解析',
  items: [
    { text: 'VirtualDOM的简单实现', link: '/source/vue/virtual-dom'},
    { text: 'new Vue()发生啥', link: '/source/vue/new-vue'},
    { text: '组件化', link: '/source/vue/component'},
    { text: '响应式原理', link: '/source/vue/reactive'},
    { text: '计算和监听属性', link: '/source/vue/watch-and-computed'},
    { text: '组件更新', link: '/source/vue/diff'},
    { text: '事件Event', link: '/source/vue/event'},
    { text: '指令v-model', link: '/source/vue/v-model'},
    { text: '插槽 slot', link: '/source/vue/slot'},
    { text: 'keep-alive', link: '/source/vue/keep-alive'},
    { text: 'Vue-Router', link: '/source/vue/vue-router'},
  ]
}, {
  text: 'Vue3 解析',
  items: []
}]

// React source
const reactSource: DefaultTheme.SidebarGroup[] = [{
  text: 'React 黑魔法',
  items: [
    { text: '浅谈 Fiber 架构', link: '/source/react/fiber' }
  ]
}];

// webpack, vite 
const enginerSouce: DefaultTheme.SidebarGroup[] = [{
  text: 'Webpack',
  items: [
    { text: 'Webpack 打包原理', link: '/source/webpack/' }
  ]
}];

const share: DefaultTheme.SidebarGroup[] = [
  { text: '面试',
    items: [
      { text: '面试题汇总', link: '/share/interview' }
    ]
  },
  {
    text: '社区',
    items: [
      { text: '社区汇总', link: '/share/website' },
      { text: '博客文章', link: '/share/posts' },
      { text: '电子书', link: '/share/books' },
    ]
  },
  { 
    text: '读书笔记',
    items: [
      { text: '深入浅出 Node.js', link: '/share/book/node' },
      { text: 'webpack实战：入门、进阶与调优', link: '/share/book/webpack' },
    ]
  }
];


const sidebarGroup = {
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
    'react': reactSource,
    'enginer': enginerSouce
  },
  share: share
}

const sidebar: DefaultTheme.Sidebar = {
  '/summary/js-base/': sidebarGroup.summary.js,
  '/summary/js-advance/': sidebarGroup.summary.js,
  '/summary/es6/': sidebarGroup.summary.js,
  '/summary/browser/': sidebarGroup.summary.browser,
  '/summary/tools/': sidebarGroup.summary.tools,
  '/source/vue/': sidebarGroup.source.vue,
  '/source/react/': sidebarGroup.source.react,
  '/source/webpack/': sidebarGroup.source.enginer,
  '/share/': sidebarGroup.share as DefaultTheme.SidebarGroup[]
}

export default sidebar;