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
      name: '规则管理',
      path: '/rules',
      component: './Rules',
      icon: 'editOutlined',
      access: 'canSeeAdmin',
    },
    {
      name: '网站管理',
      path: '/websites',
      icon: 'cloudServerOutlined',
      component: './Websites',
      access: 'canSeeAdmin',
    },
    {
      name: '系统设置',
      path: '/settings',
      icon: 'settingOutlined',
      component: './Settings',
      access: 'canSeeAdmin',
    },
    { path: '/*', component: '@/pages/404', layout: false },
  ],
  npmClient: 'pnpm',
});
