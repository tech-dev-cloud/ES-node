const responseHelper = {};

// CONSTANTS.RESPONSE = {
//   ERROR: {
//     DATA_NOT_FOUND: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 404,
//         message: message,
//         status: false,
//         type: 'DATA_NOT_FOUND',
//       };
//     },
//     BAD_REQUEST: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 400,
//         message: message,
//         status: false,
//         type: 'BAD_REQUEST',
//       };
//     },
//     MONGO_EXCEPTION: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 100,
//         message: message,
//         status: false,
//         type: 'MONGO_EXCEPTION',
//       };
//     },
//     ALREADY_EXISTS: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 400,
//         message: message,
//         status: false,
//         type: 'ALREADY_EXISTS',
//       };
//     },
//     FORBIDDEN: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 403,
//         message: message,
//         status: false,
//         type: 'Forbidden',
//       };
//     },
//     INTERNAL_SERVER_ERROR: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 500,
//         message: message,
//         status: false,
//         type: 'INTERNAL_SERVER_ERROR',
//       };
//     },
//     UNAUTHORIZED: (message) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 401,
//         message: message,
//         status: false,
//         type: 'UNAUTHORIZED',
//       };
//     }
//   },
//   SUCCESS: {
//     MISSCELANEOUSAPI: (message, data) => {
//       if (!message) {
//         message = '';
//       }
//       return {
//         statusCode: 200,
//         message: message,
//         status: true,
//         type: 'Default',
//         data
//       };
//     }
//   }
// };

let RESPONSE = {
  DATA_NOT_FOUND: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 404,
      message: message,
      status: false,
      type: 'DATA_NOT_FOUND',
    };
  },
  BAD_REQUEST: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 400,
      message: message,
      status: false,
      type: 'BAD_REQUEST',
    };
  },
  MONGO_EXCEPTION: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 100,
      message: message,
      status: false,
      type: 'MONGO_EXCEPTION',
    };
  },
  ALREADY_EXISTS: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 400,
      message: message,
      status: false,
      type: 'ALREADY_EXISTS',
    };
  },
  FORBIDDEN: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 403,
      message: message,
      status: false,
      type: 'Forbidden',
    };
  },
  INTERNAL_SERVER_ERROR: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 500,
      message: message,
      status: false,
      type: 'INTERNAL_SERVER_ERROR',
    };
  },
  UNAUTHORIZED: (message) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 401,
      message: message,
      status: false,
      type: 'UNAUTHORIZED',
    };
  },
  SUCCESS: (message, data) => {
    if (!message) {
      message = '';
    }
    return {
      statusCode: 200,
      message: message,
      status: true,
      type: 'Default',
      data
    };
  }
}

responseHelper.createErrorResponse = (errorType, message) => {
  console.log(errorType);
  return RESPONSE[errorType](message);
}

responseHelper.createSuccessResponse = (message, options) => {
  return options;
}

module.exports = responseHelper;