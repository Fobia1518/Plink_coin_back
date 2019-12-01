'use strict';
module.exports = (sequelize, DataTypes) => {
  const Coin = sequelize.define('Coin', {
    iduser: DataTypes.INTEGER,
    coin: DataTypes.STRING
  }, {});
  Coin.associate = function(models) {
    // associations can be defined here
  };
  return Coin;
};