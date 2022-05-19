const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { dbConfig } = require('../../config/config');

const basename = path.basename(__filename);
// const sequelize = require('../../config/sequalize');
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
const db = {};
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    // require(path.join(__dirname, file))(sequelize, Se quelize.DataTypes);

    // const model = sequelize.import(path.join(__dirname, file));
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// relationships for models

//= ==============================
// Define all relationships here below
//= ==============================
// db.User.hasMany(db.Address);
// db.Address.belongsTo(db.User);

module.exports = db;
