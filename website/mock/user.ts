import { defineMock } from '@umijs/max';

const user: API.UserInfo = { name: 'admin', hasAdmin: true };

export default defineMock({
  'POST /api/v1/user/login': (req, res) => {
    // 添加跨域请求头
    res.setHeader('Set-Cookie', 'token=test').json({ code: 0, success: true, data: null });
  },

  'GET /api/v1/user/info': {
    success: true,
    data: user,
    code: 0,
  },
});
