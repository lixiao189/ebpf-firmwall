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
  };

  type UpdateUserRequest = {
    username: string;
    password: string;
  };

  type UserInfo = {
    name?: string;
    hasAdmin?: boolean;
  };

  /*************** 网站设置相关  *********************/
  type Website = {
    name: string;
    api: string;
    url: string;
  };

  /*************** 规则设置相关  *********************/
  type Rule = {
    name: string;
    regex: string;
  };
}
