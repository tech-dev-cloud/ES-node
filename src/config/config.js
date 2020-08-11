module.exports = {
  Development: {
    adminCredentials: {
      email: 'admin@admin.com',
      password: 'admin'
    },
    NODE_MAILER: {
      transporter: {
        host: 'smt.gmail.com',
        secure: false,
        auth: {
          user: 'tamit9509@gmail.com', // generated ethereal user
          pass: '95@akknlvhtdscb', // generated ethereal password
        },
      },
      sender: `Amit Thakur <tamit9509@gmail.com>`
    },
    nodeMailer: {
      code: 'Gmail',
      user: 'mukkumukeshkumar321@gmail.com',
      password: 'MukeshMukku@123'
    },
    platform: 'eduseeker',
    PAYMENT_GATEWAY: {
      SALT: process.env.PRIVATE_SALT || '250a9a0f6063466793ebbad87bbe4704',
      TOKEN: process.env.PRIVATE_AUTH_TOKEN || 'test_c159de6e0eeb55d481d68ca68ff',
      API_KEY: process.env.PRIVATE_API_KEY || 'test_0fe016d1581437e91fcc47060e1'
    }
  }
};