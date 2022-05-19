const Sequelize = require('sequelize');
const { dbConfig, config } = require('./config');

const sequelize = new Sequelize(
  dbConfig.mysql.database,
  dbConfig.mysql.username,
  dbConfig.mysql.password,
  {
    host: dbConfig.mysql.host,
    dialect: dbConfig.mysql.dialect,
    // port: process.env.DB_PORT,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
