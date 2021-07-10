
const CONSTANTS = {
  DB: {
    LOGIN_TYPE: {
      EDUSEEKER: 0,
      GOOGLE: 1,
      FACEBOOK: 2
    },
    QUIZ_PLAY_STATUS: {
      NOT_STARTED: 'not_started',
      IN_PROGRESS: 'in_progress',
      HOLD: 'on_hold',
      COMPLETED: 'completed'
    },
    ANSWER_ACTION: {
      NOT_VISITED: 0,
      NOT_ANSWERED: 1,
      ANSWERED: 2,
      MARK_FOR_REVIEW: 3,
      SAVE_MARK_FOR_REVIEW: 4
    },
    ANSWER_RESULT: {
      CORRECT: 'correct',
      INCORRECT: 'incorrect',
      NOT_ATTEMPT: 'not_attempt'
    },
    QUESTION_TYPE: {
      IMAGE: 1,
      TEXT: 2
    }
  },
  LOGIN_TYPE: {
    EDUSEEKER: 'password',
    GOOGLE: 'google',
    FACEBOOK: 'fb'
  },
  ERROR_TYPE: {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    MONGO_EXCEPTION: 'MONGO_EXCEPTION',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SUCCESS: 'SUCCESS'
  },
  PRODUCTS_TYPE: {
    notes: "notes",
    quiz: "quiz",
    bulk: "bulk",
    course: "course"
  },
  DIFFICULT_LEVEL: {
    BEGINNER: 'Biginner',
    INTERMEDIATE: 'Intermediate',
    EXPERT: 'Expert'
  },
  review_type: {
    product_review: "product_review",
    lecture_query: "lecture_query",
    feedback: "feedback"
  },
  order_status: {
    pending: 'Pending',
    credit: 'Credit',
    failed: 'Failed',
    Free:'Free'
  }
};


CONSTANTS.DEFAULT = {
  INDEX: 0,
  LIMIT: 10
}

CONSTANTS.AVAILABLE_AUTH = {
  ADMIN: 1,
  USER: 2
}

CONSTANTS.EMAIL_STATUS = {
  SIGNUP: 'Registration alert.',
  FORGOT_PASSWORD: 'Forgot password alert.'
};

CONSTANTS.EMAIL_TYPES = {
  REGISTER_USER: 1,
  FORGOT_PASSWORD: 2
}

CONSTANTS.MONGO_ERROR = {
  DUPLICATE: 11000
}

CONSTANTS.EMAIL_TEMPLATE = {
  FORGOT_PASSWORD: 'public/forgot-password.html'
}

CONSTANTS.USER_ROLE = {
  TEACHER: 1,
  STUDENT: 2,
  ADMIN: 3,
}

CONSTANTS.SECURITY = {
  JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
  BCRYPT_SALT: 8
};

module.exports = { ...CONSTANTS };