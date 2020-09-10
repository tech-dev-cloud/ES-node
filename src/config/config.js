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
          pass: 'asdkncasd', // generated ethereal password
        },
      },
      sender: `tamit9509@gmail.com`
    },
    nodeMailer: {
      code: 'Gmail',
      user: 'mukkumukeshkumar321@gmail.com',
      password: 'MukeshMukku@123'
    },
    platform: 'eduseeker',
    PAYMENT_GATEWAY: {
      SALT: process.env.PRIVATE_SALT || 'a3953c4a52994262b8ec6386f82e54c1',
      TOKEN: process.env.PRIVATE_AUTH_TOKEN || 'test_f5620ac7cb2d9ede77c5017d85c',
      API_KEY: process.env.PRIVATE_API_KEY || 'test_b0c865ae388b27e2711728fee78'
    }
  }
};