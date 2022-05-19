module.exports = class HTTPResponse {
  constructor() {}

  static Forbidden(message = '', errorCode, data) {
    return {
      success: false,
      message,
      code: 403,
      errorCode,
      data,
    };
  }
  static get UnAuthorize() {
    return {
      success: false,
      message: 'Session Expired',
      code: 401,
    };
  }
  static BadRequest(message, errorCode, data) {
    return {
      success: false,
      message,
      code: 400,
      errorCode,
      data,
    };
  }
  static Duplicate(message) {
    return {
      success: false,
      message,
      code: 409,
    };
  }
  static get InternalServerError() {
    return {
      success: false,
      message: 'Something went wrong',
      code: 500,
    };
  }
  static success(res, data, message = 'success') {
    res.status(200).json({
      success: true,
      code: 200,
      message,
      ...(data ? { data } : {}),
    });
  }
};
