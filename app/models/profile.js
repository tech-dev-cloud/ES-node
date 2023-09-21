// /* jshint indent: 2 */

// module.exports = function (sequelize, DataTypes) {
//   return sequelize.define(
//     'profile',
//     {
//       user_id: {
//         type: DataTypes.INTEGER(11),
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       gender: {
//         type: DataTypes.ENUM('1', '2'),
//       },
//       city: {
//         type: DataTypes.STRING(45),
//       },
//       state: {
//         type: DataTypes.STRING(45),
//       },
//       country: {
//         type: DataTypes.STRING(45),
//       },
//       phone_number: {
//         type: DataTypes.STRING,
//       },
//       mobile_verified: {
//         type: DataTypes.ENUM('1', '2'),
//       },
//       email_verified: {
//         type: DataTypes.ENUM('1', '2'),
//       },
//       email_verification_token: {
//         type: DataTypes.STRING,
//       },
//     },
//     {
//       tableName: 'profile',
//       timestamps: false,
//     }
//   );
// };
