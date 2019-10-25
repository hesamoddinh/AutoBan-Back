const passport = require("passport");
const express = require("express");
const router = express.Router();
const config = require("config");
const path = require("path");
const fs = require("fs-extra");

const CarDAO = rootRequire("DAO/carDAO");
const PartDAO = rootRequire("DAO/partDAO");
const RepairDAO = rootRequire("DAO/repairDAO");
const ReceiptDAO = rootRequire("DAO/receiptDAO");
const CarServiceDAO = rootRequire("DAO/carServiceDAO");
const PeriodicServiceDAO = rootRequire("DAO/periodicServiceDAO");

const uploadFile = rootRequire("middlewares/uploadFile");
const i18n = rootRequire("middlewares/i18n");

router.get(
  "/service-items",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    let serviceItems = await PartDAO.getPeriodicServiceItems();
    res.json({ serviceItems });
    next();
  }
);

router.post(
  "/",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    //req.body.image = receiptImage
    const date = req.body.date;
    const totalCost = req.body.totalCost;
    let garageName = req.body.garageName;

    // serviceItems: An array for serviceItems each node containts:
    // -categoryId (partCategoryId return by /periodic-services/service-items) *required
    // -status (fail,ok,...) *required
    // -partId (id of part if changed) *optional
    // -cost (cost of part if changed) *optional
    // -count (count of part if changed) *optional
    const serviceItems = req.body.serviceItems;
    const garageId = req.body.garageId;
    const carId = req.body.carId;
    let car = await CarDAO.getById(carId);
    if (
      car.userId != req.user.id &&
      req.user.type != config.get("repairman_type")
    ) {
      throw new Error(
        "You can add periodic service to car if car is yours or you are repairman"
      );
    }
    if (garageId) {
      let garage = await GarageDAO.getById(garageId);
      garageName = garage.name;
    }
    // title, date, totalCost, garageName, garageId, creatorId, carId
    let repair = await RepairDAO.add(
      __("Periodic Service"),
      date,
      totalCost,
      garageName,
      garageId,
      req.user.id,
      carId,
      true
    );
    let receipImage = "";
    if (req.body.image) {
      receipImage = await uploadFile(
        config.get("receipt_images_dir"),
        req.body.image
      );
    }
    let receipt = await ReceiptDAO.add(
      __("Periodic Service Receipt"),
      date,
      totalCost,
      garageName,
      receipImage,
      repair.id
    );
    let service = await CarServiceDAO.getByName(__("Periodic Service"));
    if (!service) {
      service = await CarServiceDAO.add(
        __("Periodic Service"),
        "Periodic Service"
      );
    }
    let services = [{ serviceId: service.id }];
    await ReceiptDAO.addItems(receipt.id, services, serviceItems);
    await PeriodicServiceDAO.addItems(repair.id, serviceItems);
    res.json({
      periodicService: repair,
      receipt
    });
    next();
  }
);

// Address: serverAddress/periodic-services/list?carId=
router.get(
  "/",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.query.carId;
    let periodicServices = await RepairDAO.listPeriodicService(carId);
    res.json({ periodicServices });
    next();
  }
);

// Address: serverAddress/periodic-services/details?id=
router.get(
  "/:serviceId",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const id = req.params.serviceId;
    let serviceItems = await PeriodicServiceDAO.getByRepairId(id);
    let receipts = await ReceiptDAO.getByRepairId(id);
    res.json({
      serviceItems,
      receipts
    });
    next();
  }
);
module.exports = router;
