const Garage = rootRequire("startup/sequelize").Garage;
const Utils = rootRequire("middlewares/utils");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.add = async function(
  name,
  phoneNumber,
  latitude,
  longitude,
  image,
  address
) {
  return await Garage.create({
    name,
    phoneNumber,
    latitude,
    longitude,
    image,
    address
  });
};

module.exports.getById = async function(id) {
  let garage = await Garage.findByPk(id);
  if (!garage) {
    throw new Error("Garage not found");
  }
  return garage;
};
