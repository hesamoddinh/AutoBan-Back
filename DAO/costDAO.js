const config = require("config");
const Cost = rootRequire("startup/sequelize").Cost;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.getById = async function(id) {
  let cost = await Cost.findByPk(id);
  if (!cost) {
    throw new Error("Cost not found");
  }
  return cost;
};

module.exports.add = async function(type, date, value, comment, carId) {
  return await Cost.create({
    carId: carId,
    type: type,
    date: date,
    value: value,
    comment: comment
  });
};

module.exports.update = async function(cost) {
  return await cost.save();
};

module.exports.remove = async function(cost) {
  return await cost.destroy();
};

module.exports.listByCar = async function(carId, from, to) {
  let query = {
    [Op.gte]: from || "1200-01-01",
    [Op.lte]: to || "2200-01-01"
  };

  return await Cost.findAll({
    where: { carId, date: query },
    order: [["date", "DESC"]]
  });
};

module.exports.listOtherCostByCar = async function(carId, from, to) {
  let query = {
    [Op.gte]: from || "1200-01-01",
    [Op.lte]: to || "2200-01-01"
  };

  return await Cost.findAll({
    where: { carId, date: query, type: config.get("other_cost_type") },
    order: [["date", "DESC"]]
  });
};

module.exports.listCategorizedByCar = async function(carId) {
  let query = {
    [Op.gte]: from || "1200-01-01",
    [Op.lte]: to || "2200-01-01"
  };
  return await Cost.findAll({
    where: { carId, date: query },
    group: ["type"],
    attributes: [
      "type",
      [Sequelize.fn("SUM", Sequelize.col("value")), "totalCost"]
    ]
  });
};
