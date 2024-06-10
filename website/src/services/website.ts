import { request } from '@umijs/max';

export async function getWebsites(options?: { [key: string]: any }) {
  return request<API.Response<API.Website[]>>('/api/v1/admin/websites/list', {
    method: 'get',
    ...(options || {}),
  });
}

export async function addWebsite(
  params: {
    name: string;
    api: string;
    url: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<string>>('/api/v1/admin/websites/add', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function updateWebsite(
  params: {
    name: string;
    api: string;
    url: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<string>>('/api/v1/admin/websites/update', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function deleteWebsite(
  params: {
    name: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Response<string>>('/api/v1/admin/websites/delete', {
    method: 'post',
    data: {
      ...params,
    },
    ...(options || {}),
  });
}
