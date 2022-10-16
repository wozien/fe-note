import { defineConfig } from 'vitepress';
import sidebar from './sidebar';
import nav from './nav';

export default defineConfig({
  lang: 'zh-CN',
  title: 'FE-Note',
  description: '前端知识体系，包括基础知识，源码解析，优秀文章分享等',

  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: "github", link: "https://github.com/wozien/fe-note" },
    ],

    nav,
    sidebar,
  }
})