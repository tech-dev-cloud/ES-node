const CONSTANTS = {
  DB: {
    LOGIN_TYPE: {
      EDUSEEKER: 0,
      GOOGLE: 1,
      FACEBOOK: 2,
    },
    QUIZ_PLAY_STATUS: {
      NOT_STARTED: 'not_started',
      IN_PROGRESS: 'in_progress',
      HOLD: 'on_hold',
      COMPLETED: 'completed',
    },
    ANSWER_ACTION: {
      NOT_VISITED: 0,
      NOT_ANSWERED: 1,
      ANSWERED: 2,
      MARK_FOR_REVIEW: 3,
      SAVE_MARK_FOR_REVIEW: 4,
    },
    ANSWER_RESULT: {
      CORRECT: 'correct',
      INCORRECT: 'incorrect',
      NOT_ATTEMPT: 'not_attempt',
    },
    QUESTION_TYPE: {
      IMAGE: 1,
      TEXT: 2,
    },
    OFFER_TYPES: {
      PERCENT: 'percent',
      FIXED_DISCOUNT: 'fixed_discount',
      FIXED_AMOUNT: 'fixed_amount',
    },
    OFFER_VALIDITY: {
      MINUTE: 'm',
      HOUR: 'h',
      DAY: 'd',
    },
    PRODUCT_PRICE_TYPE: {
      SELLING_PRICE: 'sp',
      MRP: 'mrp',
    },
  },
  LOGIN_TYPE: {
    EDUSEEKER: 'password',
    GOOGLE: 'google',
    FACEBOOK: 'fb',
  },
  ERROR_TYPE: {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    MONGO_EXCEPTION: 'MONGO_EXCEPTION',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SUCCESS: 'SUCCESS',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  },
  PRODUCTS_TYPE: {
    notes: 'notes',
    quiz: 'quiz',
    bulk: 'bulk',
    course: 'course',
    test_series: 'test_series',
  },
  DIFFICULT_LEVEL: {
    BEGINNER: 'Biginner',
    INTERMEDIATE: 'Intermediate',
    EXPERT: 'Expert',
  },
  review_type: {
    product_review: 'product_review',
    lecture_query: 'lecture_query',
    feedback: 'feedback',
  },
  order_status: {
    pending: 'Pending',
    credit: 'Credit',
    failed: 'Failed',
    Free: 'Free',
  },
  quiz_result: {
    fail: {
      title: 'Try Harder Next Time',
      subtitle: "You didn't meet the cut-off",
      banner:
        'https://eduseeker-image-bucket.s3.ap-south-1.amazonaws.com/s1/1629031275258not_qualified.webp',
    },
    pass: {
      title: 'Congratulations! You have passed the cut-off',
      subtitle: 'Good Job!',
      banner:
        'https://eduseeker-image-bucket.s3.amazonaws.com/dev/1629178932103QUALIFIED.webp',
    },
  },
  REGISTER_TYPE: {
    subscribe: 'subscribe',
    signup: 'signup',
  },
  MODULES: {
    notification: 'Notification',
  },
  EMAIL_TYPE: {
    OFFER: 'offer',
    LAUNCH: 'launch',
    THANKS_FOR_PURCHASE: 'thankyou',
  },
  NOTIFICATION_TYPE: {
    EMAIL: 'email',
    IN_APP: 'in_app',
    WEB_PUSH: 'web_push',
  },
  USER_GROUP: {
    subscribers: 'subscribers',
    registerd: 'registered',
    allUsers: 'all',
  },
  REDIRECTION_URL: {
    COURSE: '/learn/{{id}}?redirect=true',
    NOTES: '/products/pdf-4/{{id}}?redirect=true',
    QUIZ: '/products/quiz-5/{{id}}?redirect=true',
    TEST_SERIES: '/profile?redirect=true&q=test_series',
    BULK: '/products/bulk-2/{{id}}?redirect=true',
    EMAIL_VERIFICATION: '/auth/email-verified/{{verificationToken}}',
  },
  NOTIFICATION_ACTION: {
    VIEW: 'view',
  },
  NOTIFICATION_CATEGORY: {
    OFFER: 'offer',
    LAUNCH: 'new_launch',
    ENROLLMENT: 'new_enrollment',
    PRODUCT_REVIEW: 'product_review',
    COURSE_QUESTION: 'course_question',
  },
};

CONSTANTS.DEFAULT = {
  INDEX: 0,
  LIMIT: 10,
};

CONSTANTS.AVAILABLE_AUTH = {
  ADMIN: 1,
  USER: 2,
};

CONSTANTS.EMAIL_STATUS = {
  SIGNUP: 'Registration alert.',
  FORGOT_PASSWORD: 'Forgot password alert.',
  NEW_LAUNCH: '',
};

CONSTANTS.EMAIL_TYPES = {
  REGISTER_USER: 1,
  FORGOT_PASSWORD: 2,
  NEW_LAUNCH: 3,
  OFFER_LAUNCH: 4,
  PURCHASE_THANKS: 5,
};

CONSTANTS.MONGO_ERROR = {
  DUPLICATE: 11000,
};

CONSTANTS.EMAIL_TEMPLATE = {
  FORGOT_PASSWORD: 'public/forgot-password.html',
  THANK_YOU: 'public/thankyou.html',
  ENROLLMENT_EXPIRE: 'public/enrollment-expire.html',
  EMAIL_VERIFICATION: 'public/email-verify.html',
  OTP_VERIFICATION: 'public/otp-verify.html',
};

CONSTANTS.USER_ROLE = {
  TEACHER: 1,
  STUDENT: 2,
  ADMIN: 3,
};

CONSTANTS.SECURITY = {
  JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
  BCRYPT_SALT: 8,
};

module.exports = { ...CONSTANTS };
