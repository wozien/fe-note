const sidebar = require('./sidebar')

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
    lastUpdatedText: '上次更新',
    author: 'wozien',
    smoothScroll: true,

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
    },
    sidebarDepth: 1
  },

  bundler: process.env.NODE_ENV === 'production' ? '@vuepress/bundler-webpack' : '@vuepress/bundler-vite'
}
