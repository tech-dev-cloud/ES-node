module.exports = class HTTPResponse {
  constructor() {}

  static Forbidden(message = '', errorCode, data) {
    return {
      success: false,
      message,
      statusCode: 403,
      errorCode,
      data,
    };
  }
  static get UnAuthorize() {
    return {
      success: false,
      message: 'Session Expired',
      statusCode: 401,
    };
  }
  static BadRequest(message, errorCode, data) {
    return {
      success: false,
      message,
      statusCode: 400,
      errorCode,
      data,
    };
  }
  static Duplicate(message) {
    return {
      success: false,
      message,
      statusCode: 409,
    };
  }
  static get InternalServerError() {
    return {
      success: false,
      message: 'Something went wrong',
      statusCode: 500,
    };
  }
  static success(res, data, message = 'success') {
    res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      ...(data ? { data } : {}),
    });
  }
};
