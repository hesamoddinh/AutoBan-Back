const config = require("config");
const Fine = require("../startup/sequelize").Fine;
const FineCategory = require("../startup/sequelize").FineCategory;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.getFineById = async function(id) {
  var fine = await Fine.findOne({ where: { id: id }, include: [FineCategory] });
  if (!fine) {
    throw new Error("Fine not found");
  }
  return fine;
};

module.exports.getFineByCostId = async function(costId) {
  var fine = await Fine.findOne({ where: { costId: costId }, include: [FineCategory] });
  if (!fine) {
    throw new Error("Fine not found");
  }
  return fine;
};

module.exports.addFine = async function(fineCode, costId) {
  return await Fine.create({
    costId: costId,
    fineCategoryCode: fineCode
  });
};

module.exports.updateFine = async function(fine) {
  return await fine.save();
};

module.exports.removeFine = async function(fine) {
  return await fine.destroy();
};