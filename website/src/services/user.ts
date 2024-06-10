/* eslint-disable */
import { request } from '@umijs/max';

export async function login(
  params: {
    username: string;
    password: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<null>>('/api/v1/user/login', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function info(options?: { [key: string]: any }) {
  return request<API.Response<API.UserInfo>>('/api/v1/user/info', {
    method: 'get',
    ...(options || {}),
  });
}

export async function updateUser(
  params: API.UpdateUserRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response<null>>('/api/v1/user/update', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}
