const errorCodes = {
  //   BAD_REQUEST: {
  //     statusCode: 400,
  //     message: "Bad Request",
  //     type: "BAD_REQUEST"
  //   },
  SOMETHING_WENT_WRONG: {
    statusCode: 500,
    message: 'Something went wrong.',
    type: 'WENT_WRONG',
  },
  DUPLICATE_ENTRY: {
    statusCode: 400,
    message: '{{key}} Already Exists',
    type: 'DUPLICATE_ENTRY',
  },
  //   USER_NAME_ALREADY_EXIST: {
  //     statusCode: 400,
  //     message: 'User Name Already Exists',
  //     type: 'USER_NAME_ALREADY_EXIST'
  //   },
  //   INVALID_MEDIA_TYPE: {
  //     statusCode: 400,
  //     message: 'unsupported media',
  //     type: 'INVALID_MEDIA_TYPE'
  //   },
  //   QR_CODE_NOT_FOUND: {
  //     statusCode: 400,
  //     message: 'QR Code is invalid or expired.',
  //     type: 'QR_CODE_NOT_FOUND'
  //   },
  //   INVALID_OLD_PASSWORD: {
  //     statusCode: 400,
  //     message: 'old password is incorrect.',
  //     type: 'INVALID_OLD_PASSWORD'
  //   },
  //   PASSWORD_UPDATE_ERROR: {
  //     statusCode: 400,
  //     message: 'unable to update password.',
  //     type: 'PASSWORD_UPDATE_ERROR'
  //   },
  //   REPEATED_ACTION: {
  //     statusCode: 400,
  //     type: 'REPEATED_ACTION',
  //     message: 'invalid or repeated action'
  //   },
  //   USER_NOT_FOUND: {
  //     statusCode: 400,
  //     type: 'USER_NOT_FOUND',
  //     message: 'user not found'
  //   },
  //   DB_ERROR: {
  //     statusCode: 400,
  //     message: 'DB Error : ',
  //     type: 'DB_ERROR'
  //   },
  //   UNABLE_TO_EDIT_TICKET: {
  //     statusCode: 400,
  //     message: 'unable to edit ticket ',
  //     type: 'UNABLE_TO_EDIT_TICKET'
  //   },
  //   FILE_UPLOAD_ERROR: {
  //     statusCode: 400,
  //     message: 'Error in uploading file. Please try again.',
  //     type: 'FILE_UPLOAD_ERROR'
  //   },
  //   UNABLE_TO_UPDATE_PASSWORD: {
  //     statusCode: 400,
  //     message: 'Unable to update password',
  //     type: 'UNABLE_TO_UPDATE_PASSWORD'
  //   },
  //   DEFAULT: {
  //     statusCode: 400,
  //     message: 'Error',
  //     type: 'DEFAULT'
  //   },
  EMAIL_NOT_FOUND: {
    statusCode: 400,
    message: 'User with provided email address is not registered with us',
    type: 'EMAIL_NOT_FOUND',
  },
  //   EMAIL_NOT_VERIFY: {
  //     statusCode: 400,
  //     message: 'Please verify your email first.',
  //     type: 'EMAIL_NOT_VERIFY'
  //   },
  //   NOT_FOUND: {
  //     statusCode: 400,
  //     message: 'Post Not Found',
  //     type: 'NOT_FOUND'
  //   },
  INVALID_CREDENTIALS: {
    statusCode: 400,
    message: 'Invalid email or password',
    type: 'INVALID_CREDENTIALS',
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: 'You are not authorized to perform this action',
    type: 'UNAUTHORIZED',
  },
  SESSION_EXPIRE: {
    statusCode: 400,
    message: 'Session expired',
    type: 'SESSION_EXPIRE',
  },
  DEVICE_LOGIN_LIMIT_EXCEED: {
    statusCode: 403,
    message:
      'This account is already being used on two other devices. If that\'s not you, please reset your password to avoid misuse your account.',
    type: 'DEVICE_LOGIN_LIMIT_EXCEED',
  },
  NOT_ENROLLED: {
    statusCode: 402,
    message: 'You have not enroll for this course',
  },
  //   DUPLICATE: {
  //     statusCode: 400,
  //     message: 'Duplicate Entry',
  //     type: 'DUPLICATE'
  //   },

  //   DUPLICATE_ADDRESS: {
  //     statusCode: 400,
  //     message: 'Address Already Exist',
  //     type: 'DUPLICATE_ADDRESS'
  //   },
  //   DELETE_TARGET_IN_USE: {
  //     statusCode: 400,
  //     message: 'Record in Use. Cannot be Deleted',
  //     type: 'DELETE_TARGET_IN_USE'
  //   }
};

module.exports = errorCodes;
