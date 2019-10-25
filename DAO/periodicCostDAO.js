const config = require("config");
const PeriodicCost = rootRequire("startup/sequelize").PeriodicCost;
const Cost = rootRequire("startup/sequelize").Cost;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.getById = async function(id) {
  let periodicCost = await PeriodicCost.findByPk(id, { include: [Cost] });
  if (!periodicCost) {
    throw new Error("PeriodicCost not found");
  }
  return periodicCost;
};

module.exports.getByCostId = async function(costId) {
  let periodicCost = await PeriodicCost.findOne({
    where: { costId },
    include: [Cost]
  });
  if (!periodicCost) {
    throw new Error("PeriodicCost not found");
  }
  return periodicCost;
};

module.exports.add = async function(type, period, costId) {
  return await PeriodicCost.create({
    costId: costId,
    type: type,
    period: period
  });
};

module.exports.update = async function(periodicCost) {
  return await periodicCost.save();
};

module.exports.remove = async function(periodicCost) {
  return await periodicCost.destroy();
};

module.exports.listByCar = async function(carId, from, to) {
  let query = {
    [Op.gte]: from || "1200-01-01",
    [Op.lte]: to || "2200-01-01"
  };

  return await PeriodicCost.findAll({
    include: [{ model: Cost, where: { carId, date: query } }],
    order: [[Cost, "date", "DESC"]]
  });
};
