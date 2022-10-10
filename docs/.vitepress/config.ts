import { defineConfig } from 'vitepress';
import sidebar from './sidebar';

export default defineConfig({
  lang: 'zh-CN',
  title: 'FE-Note',
  description: '前端知识体系，包括基础知识，源码解析，优秀文章分享等',

  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: "github", link: "https://github.com/wozien/fe-note" },
    ],

    nav: [
      { 
        text: '基础', 
        activeMatch: '^/summary/',
        items: [
          { text: 'Javascript', link: '/summary/js-base/function-context'},
          { text: '浏览器', link: '/summary/browser/render' },
          { text: '效能工具', link: '/summary/tools/docker'},
        ]
      },
      { 
        text: '进阶', 
        activeMatch: '^/source/',
        items: [
          { text: 'Vue', link: '/source/vue/virtual-dom' },
          { text: 'React', link: '/source/react/fiber' },
          { text: '工程化', link: '/source/enginer/webpack' }
        ]
      },
      { text: '分享', link: '/share/interview', activeMatch: '^/share/'}
    ],

    sidebar,
  }
})