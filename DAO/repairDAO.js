const Repair = rootRequire("startup/sequelize").Repair;
const bcrypt = require("bcryptjs");
const Utils = rootRequire("middlewares/utils");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.getById = async function(id) {
  let repair = await Repair.findByPk(id);
  if (!repair) {
    throw new Error("Repair not found");
  }
  return repair;
};

module.exports.add = async function(
  title,
  date,
  totalCost,
  garageName,
  garageId,
  creatorId,
  carId,
  isPeriodicService = false
) {
  return await Repair.create({
    title,
    date,
    totalCost,
    garageName,
    garageId,
    creatorId,
    carId,
    isPeriodicService
  });
};

module.exports.update = async function(repair) {
  return await repair.save();
};

module.exports.remove = async function(repair) {
  return await repair.destroy();
};

module.exports.list = async function(carId) {
  return await Repair.findAll({ where: { carId, isPeriodicService: false } });
};

module.exports.listPeriodicService = async function(carId) {
  return await Repair.findAll({ where: { carId, isPeriodicService: true } });
};
