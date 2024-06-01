export default (initialState: API.UserInfo) => {
  const canSeeAdmin = !!(initialState && initialState.hasAdmin);
  return {
    canSeeAdmin,
  };
};
