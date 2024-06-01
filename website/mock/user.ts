const user = { name: 'admin' };

export default {
  'GET /api/v1/login': {
    success: true,
    data: null,
    code: 0,
  },

  'GET /api/v1/info': {
      sucess: true,
      data: user,
      code: 0,
  },
};
