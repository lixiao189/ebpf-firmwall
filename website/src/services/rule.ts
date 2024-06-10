import { request } from '@umijs/max';

export async function getRules(options?: { [key: string]: any }) {
  return request<API.Response<API.Rule[]>>('/api/v1/admin/rules/list', {
    method: 'get',
    ...(options || {}),
  });
}

export async function addRule(
  params: {
    name: string;
    regex: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<string>>('/api/v1/admin/rules/add', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateRule(
  params: {
    username: string;
    password: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<string>>('/api/v1/admin/rules/update', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deleteRule(
  params: {
    name: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<string>>('/api/v1/admin/rules/delete', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}
