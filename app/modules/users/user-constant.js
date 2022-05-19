const registerType = {
  simpleLogin: 'password',
  googleLogin: 'google',
};

const userSessionType = {
  preLogin: 1,
  postLogin: 2,
};
module.exports = { registerType, userSessionType };
