const sidebar = {
  summary: {
    'js': [
      {
        text: 'JS 基础',
        children: [
          { text: '函数上下文', link: '/summary/js-base/function-context'},
          { text: '作用域', link: '/summary/js-base/scope'}
        ]
      },
      {
        text: 'JS 专题',
        children: [
          { text: '防抖和节流', link: '/summary/js-advance/debounce-and-throttle' }
        ]
      },
      {
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
        ]
      }
    ],
    'tools': [
      {
        text: '开发工具',
        children: [
          { text: 'Docker', link: '/summary/tools/docker' }
        ]
      }
    ]
  } ,
  source: [
    {
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
  ],
  share: [
    { text: '面试', link: '/share/interview' },
    { text: '网址社区', link: '/share/website' },
    { text: '电子书', link: '/share/books' }
  ]
}

module.exports = {
  lang: 'zh-CN',
  title: 'Wozien\'s Note',
  description: '前端知识体系，包括基础知识，源码解析，优秀文章分享等',
  plugins: [
    ['@vuepress/plugin-search', {
      locales: {
        '/': {
          placeholder: 'Search',
        }
      }
    }]
  ],

  themeConfig: {
    repo: 'wozien/fe-note',
    editLink: false,
    contributors: false,

    navbar: [
      { 
        text: '总结', 
        activeMatch: '^/summary/',
        children: [
          { text: 'Javascript', link: '/summary/js-base/function-context'},
          { text: '开发工具', link: '/summary/tools/docker'},
        ]
      },
      { text: '源码', link: '/source/vue/virtual-dom', activeMatch: '^/source/' },
      { text: '搬运工', link: '/share/interview', activeMatch: '^/share/'}
    ],

    sidebar: {
      '/summary/js-base/': sidebar.summary.js,
      '/summary/js-advance/': sidebar.summary.js,
      '/summary/es6/': sidebar.summary.js,
      '/summary/ts/': sidebar.summary.js,
      '/summary/tools/': sidebar.summary.tools,
      '/source/': sidebar.source,
      '/share/': sidebar.share
    }
  },

  bundler: process.env.NODE_ENV === 'production' ? '@vuepress/bundler-webpack' : '@vuepress/bundler-vite'
}
