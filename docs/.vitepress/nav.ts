import type { DefaultTheme } from 'vitepress';

const nav: DefaultTheme.NavItem[] = [
  { 
    text: '总结', 
    activeMatch: '^/summary/',
    items: [
      { 
        text: '前端知识', 
        items: [
          { text: 'Javascript', link: '/summary/js-base/function-context'},
          { text: 'Node.js', link: '/summary/nodejs/'},
          { text: '浏览器', link: '/summary/browser/render' },
        ]
      },
      {
        text: '计算机',
        items: [
          { text: '数据结构算法', link: '/summary/algorithm/link' }
        ]
      },
      { 
        text: '效能工具',
        items: [
          { text: 'Docker', link: '/summary/tools/docker' },
          { text: 'Git', link: '/summary/tools/git' }
        ] 
      },
    ]
  },
  { 
    text: '源码', 
    activeMatch: '^/source/',
    items: [
      { 
        text: '框架',
        items: [
          { text: 'Vue', link: '/source/vue/virtual-dom' },
          { text: 'React', link: '/source/react/fiber' },
        ]
      },
      { 
        text: '工程化', 
        items: [
          { text: 'Webpack', link: '/source/webpack/' },
          { text: 'Vite', link: '/source/vite/' },
        ]
      }
    ]
  },
  { text: '分享', link: '/share/interview', activeMatch: '^/share/'}
];

export default nav;