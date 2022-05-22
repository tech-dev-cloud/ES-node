// /* jshint indent: 2 */

// module.exports = function (sequelize, DataTypes) {
//   return sequelize.define(
//     'users',
//     {
//       id: {
//         type: DataTypes.INTEGER(11),
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       password: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       register_type: {
//         type: DataTypes.ENUM('1', '2'),
//       },
//       created_at: {
//         type: DataTypes.DATE,
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//       },
//     },
//     {
//       tableName: 'users',
//       timestamps: false,
//     }
//   );
// };
