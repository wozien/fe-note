const sidebar = {
  summary: [
    {
      text: 'JS 基础',
      children: [
        { text: '函数上下文', link: '/summary/js-base/function-context'}
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
      ]
    }
  ],
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
  description: '前端知识体系，包括基础知识，源码解析， 优秀文章分享等',

  themeConfig: {
    repo: 'wozien/fe-note',

    nav: [
      { text: '总结', link: '/summary/js-base/function-context', activeMatch: '^/summary/' },
      { text: '源码', link: '/source/vue/virtual-dom', activeMatch: '^/source/' },
      { text: '搬运工', link: '/share/interview', activeMatch: '^/share/'}
    ],

    sidebar: {
      '/summary/': sidebar.summary,
      '/source/': sidebar.source,
      '/share/': sidebar.share
    }
  }
}
