import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: 'data',
  },
  layout: {
    title: '@umijs/max',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8082/',
      changeOrigin: true,
    },
  },
  routes: [
    {
      path: '/login',
      component: '@/pages/Login',
      layout: false,
    },
    {
      path: '/',
      redirect: '/login',
    },
    {
      name: '数据统计',
      path: '/dashboard',
      component: './Dashboard',
      access: 'canSeeAdmin',
    },
    {
      name: '攻击事件',
      path: '/events',
      component: './Events',
      access: 'canSeeAdmin',
    },
    {
      name: '规则管理',
      path: '/rules',
      component: './Rules',
      access: 'canSeeAdmin',
    },
    {
      name: '网站管理',
      path: '/websites',
      component: './Websites',
      access: 'canSeeAdmin',
    },
    {
      name: '系统设置',
      path: '/settings',
      component: './Settings',
      access: 'canSeeAdmin',
    },
    { path: '/*', component: '@/pages/404', layout: false },
  ],
  npmClient: 'pnpm',
});
