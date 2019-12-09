'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    username: DataTypes.STRING,
    contrasena: DataTypes.STRING,
    monedaPrefe: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};