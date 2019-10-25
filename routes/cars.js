const passport = require("passport");
const express = require("express");
const router = express.Router();
const config = require("config");
const path = require("path");
const fs = require("fs-extra");

const i18n = rootRequire("middlewares/i18n");
const uploadFile = rootRequire("middlewares/uploadFile");
const authorize = rootRequire("middlewares/authorize");
const checkPoint = rootRequire("middlewares/checkPoint");
const CarDAO = rootRequire("DAO/carDAO");
const CarModelDAO = rootRequire("DAO/carModelDAO");
const CarBrandDAO = rootRequire("DAO/carBrandDAO");
const UserDAO = rootRequire("DAO/userDAO");
const ColorDAO = rootRequire("DAO/colorDAO");
const USER = config.get("user_type");
const ADMIN = config.get("admin_type");

// Add new Car
router.post(
  "/",
  [
    passport.authenticate("jwt", { session: false }),
    i18n,
    authorize([USER]),
    checkPoint
  ],
  async (req, res, next) => {
    let user = await UserDAO.getByIdSync(req.user.id);
    const userId = user.id;
    const modelId = req.body.modelId;
    const colorId = req.body.colorId;
    let image = "";
    const name = req.body.name;
    const plate = req.body.plate;
    const odometer = req.body.odometer;
    const builtyear = req.body.builtyear;
    if (req.body.image) {
      image = await uploadFile(config.get("car_images_dir"), req.body.image);
    }
    let car = await CarDAO.add(
      name,
      plate,
      image,
      odometer,
      builtyear,
      userId,
      modelId,
      colorId
    );
    res.json({ car });
    next();
  }
);

// Update A Car
router.put(
  "/:carId/",
  [passport.authenticate("jwt", { session: false }), i18n, authorize([USER])],
  async (req, res, next) => {
    const carId = req.params.carId;
    let user = await UserDAO.getByIdSync(req.user.id);
    let car = await CarDAO.getById(carId);
    const userId = user.id;
    if (car.userId != userId) {
      throw new Error("You can change your car information only");
    }
    car.name = req.body.name;
    car.plate = req.body.plate;
    car.odometer = req.body.odometer;
    car.builtyear = req.body.builtyear;
    car.modelId = req.body.modelId;
    car.colorId = req.body.colorId;
    if (car.image) {
      fs.removeSync(path.join(rootPath, car.image));
    }
    if (req.body.image) {
      car.image = await uploadFile(
        config.get("car_images_dir"),
        req.body.image
      );
    }
    car = await CarDAO.update(car);
    res.json({ car });
    next();
  }
);

// delete A Car
router.delete(
  "/:carId/",
  [passport.authenticate("jwt", { session: false }), i18n, authorize([USER])],
  async (req, res, next) => {
    const carId = req.params.carId;
    let user = await UserDAO.getByIdSync(req.user.id);
    let car = await CarDAO.getById(carId);
    const userId = user.id;
    if (car.userId != userId) {
      throw new Error("You can remove your car only");
    }
    car = await CarDAO.remove(car);
    res.json({ message: __("Car deleted successfuly") });
    next();
  }
);

// Update Odometer Of A Car
router.put(
  "/:carId/odometer",
  [passport.authenticate("jwt", { session: false }), i18n, authorize([USER])],
  async (req, res, next) => {
    const carId = req.params.carId;
    const odometer = req.body.odometer;
    let user = await UserDAO.getByIdSync(req.user.id);
    let car = await CarDAO.getById(carId);
    if (car.userId != user.id) {
      throw new Error("You can change your car information only");
    }
    car = await CarDAO.updateOdometer(car, odometer);
    res.json({ message: __("Odometer updated successfuly") });
    next();
  }
);

// List All Car of a User
router.get(
  "/",
  [passport.authenticate("jwt", { session: false }), i18n, authorize([USER])],
  async (req, res, next) => {
    let cars = await CarDAO.list(req.user.id);
    res.json({ cars });
    next();
  }
);

// Call By Admin
// get mobileNumber & return users cars
router.post(
  "/list-cars",
  [passport.authenticate("jwt", { session: false }), i18n, authorize([ADMIN])],
  async (req, res, next) => {
    const mobileNumber = req.body.mobileNumber;
    let user = await UserDAO.getByUsername(mobileNumber);
    let cars = await CarDAO.list(user.id);
    res.json({ cars });
    next();
  }
);

router.get(
  "/brands",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    let carBrands = await CarBrandDAO.listCarBrands();
    res.json({ carBrands });
    next();
  }
);

router.post(
  "/models",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const brandId = req.body.brandId;
    let carModels = await CarModelDAO.listCarModels(brandId);
    res.json({ carModels });
    next();
  }
);

router.get(
  "/colors",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    let colors = await ColorDAO.list();
    res.json({ colors });
    next();
  }
);

router.get(
  "/color",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    if (req.query.id) {
      let color = await ColorDAO.getById(req.query.id);
      res.json({ color });
    } else {
      let color = await ColorDAO.getByName(req.query.persianName);
      res.json({ color });
      next();
    }
  }
);

router.get(
  "/car-model",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    if (req.query.id) {
      let carModel = await CarModelDAO.getById(req.query.id);
      res.json({ carModel });
    } else {
      let carModel = await CarModelDAO.getByName(req.query.persianName);
      res.json({ carModel });
      next();
    }
  }
);

router.get(
  "/car-brand",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    if (req.query.id) {
      let carBrand = await CarBrandDAO.getById(req.query.id);
      res.json({ carBrand });
    } else {
      let carBrand = await CarBrandDAO.getByName(req.query.persianName);
      res.json({ carBrand });
      next();
    }
  }
);

module.exports = router;
