import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '数据统计',
      path: '/dashboard',
      component: './Dashboard',
    },
    {
      name: '攻击事件',
      path: '/events',
      component: './Events',
    },
    {
      name: '网站管理',
      path: '/websites',
      component: './Websites',
    },
    {
      name: '系统设置',
      path: '/settings',
      component: './Settings',
    },
  ],
  npmClient: 'pnpm',
});
