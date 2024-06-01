// 运行时配置
import { info } from '@/services/user';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<API.UserInfo> {
  const res = await info();
  if (res.success) {
    localStorage.setItem('name', res.data.name || '');
    return res.data;
  } else {
    return {
      name: '',
      hasAdmin: false,
    };
  }
}

export const layout = () => {
  return {
    title: 'ebpf 防火墙',
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};
