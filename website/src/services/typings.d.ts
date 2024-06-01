/* eslint-disable */

declare namespace API {
  type Response<T = any> = {
    success: boolean;
    data: T;
    code: number;
  };

  /*************** 用户请求相关  *********************/
  type LoginRequest = {
    username: string;
    password: string;
  }

  type UserInfo = {
    name?: string;
    hasAdmin?: boolean;
  }

  /*************** 网站设置相关  *********************/
  type SiteSetting = {
    title: string;
    url: string;
  }
}
