const RedisWrapper = require('../utils/redis-util');
const params = require('../../config/env/development_params.json');
const HTTPResponse = require('../HTTPResponse/http-response');
const { userSessionType } = require('../modules/users/user-constant');
const { decryptJwt } = require('../utils/commonFunctions');

function userAuthentication(authType) {
  return async (request, response, next) => {
    const accessToken = request.headers.authorization || '';
    const tokenData = decryptJwt(accessToken);
    const prefix =
      authType == userSessionType.postLogin
        ? params.userAuthentication
        : params.preUserAuthentication;
    const userData = await RedisWrapper.get(
      `${prefix}${tokenData.id}_${accessToken}`
    );
    if (userData) {
      request.user = JSON.parse(userData);
      next();
    } else {
      const error = HTTPResponse.UnAuthorize;
      response.status(error.code).json(error);
    }
  };
}

module.exports = { userAuthentication };
