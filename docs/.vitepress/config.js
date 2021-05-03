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
        { text: 'let 和 const', link: '/summary/es6/let-and-const'}
      ]
    }
  ],
  source: [
    {
      text: 'Vue 2.x',
      children: [
        { text: 'VirtualDOM的简单实现', link: '/source/vue/virtual-dom'},
        { text: 'new Vue 发生啥', link: '/source/vue/new-vue'}
      ]
    }
  ]
}

module.exports = {
  lang: 'zh-CN',
  title: 'Wozien\'s Note',
  description: '前端知识体系，包括基础知识，源码解析， 优秀文章分享等',

  themeConfig: {
    repo: 'wozien/fe-note',

    nav: [
      { text: '知识总结', link: '/summary/js-base/function-context', activeMatch: '^/summary/' },
      { text: '源码分析', link: '/source/vue/virtual-dom', activeMatch: '^/source/' },
      { text: '优秀文章', link: '/share/', activeMatch: '^/share/'}
    ],

    sidebar: {
      '/summary/': sidebar.summary,
      '/source/': sidebar.source,
      '/': sidebar.summary
    }
  }
}
