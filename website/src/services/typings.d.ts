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
}
