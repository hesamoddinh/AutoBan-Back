const passport = require("passport");
const express = require("express");
const router = express.Router();
const config = require("config");
const i18n = rootRequire("middlewares/i18n");
const CarDAO = rootRequire("DAO/carDAO");
const CostDAO = rootRequire("DAO/costDAO");
const FuelDAO = rootRequire("DAO/fuelDAO");
const FineDAO = rootRequire("DAO/fineDAO");
const PeriodicCostDAO = rootRequire("DAO/periodicCostDAO");

//TODO list for all cost types, update for all cost types
router.post(
  "/fuel",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;
    const volume = req.body.volume;
    const type = req.body.type;
    const odometer = req.body.odometer;
    const isFull = req.body.isFull;
    const stationName = req.body.stationName;

    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can add cost to your car only");
    }
    let cost = await CostDAO.add(
      config.get("fuel_cost_type"),
      date,
      value,
      comment,
      carId
    );
    let fuel = await FuelDAO.add(
      volume,
      type,
      odometer,
      isFull,
      stationName,
      cost.id
    );
    fuel.dataValues.cost = cost;
    if (odometer && odometer > car.odometer) {
      await CarDAO.updateOdometer(car, odometer);
    }
    res.json({ fuel });
    next();
  }
);

router.put(
  "/fuel",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const fuelId = req.body.id;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;
    const volume = req.body.volume;
    const type = req.body.type;
    const odometer = req.body.odometer;
    const isFull = req.body.isFull || false;
    const stationName = req.body.stationName;

    let fuel = await FuelDAO.getById(fuelId);
    let cost = fuel.cost;
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can update your car's cost only");
    }
    cost.date = date;
    cost.value = value;
    cost.comment = comment;
    cost = await CostDAO.update(cost);
    fuel.volume = volume;
    fuel.type = type;
    fuel.odometer = odometer;
    fuel.isFull = isFull;
    fuel.stationName = stationName;
    fuel = await FuelDAO.update(fuel);
    fuel.cost = cost;
    if (odometer && odometer > car.odometer) {
      await CarDAO.updateOdometer(car, odometer);
    }
    res.json({ fuel });
    next();
  }
);

router.delete(
  "/fuel",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const fuelId = req.query.fuelId;
    let fuel = await FuelDAO.getById(fuelId);
    let cost = fuel.cost;
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can remove your car's cost only");
    }
    await CostDAO.remove(cost);
    res.json({ message: __("Fuel deleted successfuly") });
    next();
  }
);

router.get(
  "/fine-categories",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    let fineCategories = await FineDAO.listFineCategory();
    res.json({ fineCategories });
    next();
  }
);

router.post(
  "/fine",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;
    const fineCode = req.body.fineCode;

    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can add cost to your car only");
    }
    let cost = await CostDAO.add(
      config.get("fine_cost_type"),
      date,
      value,
      comment,
      carId
    );
    let fine = await FineDAO.add(fineCode, cost.id);
    fine.dataValues.cost = cost;
    res.json({ fine });
    next();
  }
);

router.put(
  "/fine",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const fineId = req.body.id;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;
    const fineCode = req.body.fineCode;

    let fine = await FineDAO.getById(fineId);
    let cost = fine.cost;
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can update your car's cost only");
    }
    cost.date = date;
    cost.value = value;
    cost.comment = comment;
    cost = await CostDAO.update(cost);
    fine.fineCode = fineCode;
    fine = await FineDAO.update(fine);
    fine.cost = cost;

    res.json({ fine });
    next();
  }
);

router.delete(
  "/fine",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const fineId = req.query.fineId;
    let fine = await FineDAO.getById(fineId);
    let cost = fine.cost;
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can remove your car's cost only");
    }
    await CostDAO.remove(cost);
    res.json({ message: __("Fine deleted successfuly") });
    next();
  }
);

router.post(
  "/periodic",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;
    const type = req.body.type;
    const period = req.body.period;

    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can add cost to your car only");
    }
    let cost = await CostDAO.add(
      config.get("periodic_cost_type"),
      date,
      value,
      comment,
      carId
    );
    let periodicCost = await PeriodicCostDAO.add(type, period, cost.id);
    periodicCost.dataValues.cost = cost;
    res.json({ periodicCost });
    next();
  }
);

router.put(
  "/periodic",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const periodicCostId = req.body.id;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;
    const type = req.body.type;
    const period = req.body.period;

    let periodicCost = await PeriodicCostDAO.getById(periodicCostId);
    let cost = periodicCost.cost;
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can update your car's cost only");
    }
    cost.date = date;
    cost.value = value;
    cost.comment = comment;
    cost = await CostDAO.update(cost);
    periodicCost.type = type;
    periodicCost.period = period;
    periodicCost = await PeriodicCostDAO.update(periodicCost);
    periodicCost.cost = cost;

    res.json({ periodicCost });
    next();
  }
);

router.delete(
  "/periodic",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const periodicCostId = req.query.periodicCostId;
    let periodicCost = await PeriodicCostDAO.getById(periodicCostId);
    let cost = periodicCost.cost;
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can remove your car's cost only");
    }
    await CostDAO.remove(cost);
    res.json({ message: __("PeriodicCost deleted successfuly") });
    next();
  }
);

router.post(
  "/other",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;

    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can add cost to your car only");
    }
    let cost = await CostDAO.add(
      config.get("other_cost_type"),
      date,
      value,
      comment,
      carId
    );
    res.json({ cost });
    next();
  }
);

router.put(
  "/other",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const costId = req.body.id;
    const date = req.body.date;
    const value = req.body.value;
    const comment = req.body.comment;

    let cost = await CostDAO.getById(costId);
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can update your car's cost only");
    }
    cost.date = date;
    cost.value = value;
    cost.comment = comment;
    cost = await CostDAO.update(cost);
    res.json({ cost });
    next();
  }
);

router.delete(
  "/other",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const costId = req.query.costId;
    let cost = await CostDAO.getById(costId);
    let car = await CarDAO.getById(cost.carId);
    if (car.userId != req.user.id) {
      throw new Error("You can remove your car's cost only");
    }
    await CostDAO.remove(cost);
    res.json({ message: __("Cost information deleted successfuly") });
    next();
  }
);

router.post(
  "/list",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const from = req.body.from;
    const to = req.body.to;
    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can list your car's cost only");
    }
    // let costs = await CostDAO.listByCar(carId, from, to);
    let fines = await FineDAO.listByCar(carId, from, to);
    let fuels = await FuelDAO.listByCar(carId, from, to);
    let periodicCosts = await PeriodicCostDAO.listByCar(carId, from, to);
    let otherCosts = await CostDAO.listOtherCostByCar(carId, from, to);
    res.json({ fines, fuels, periodicCosts, otherCosts });
    next();
  }
);

router.post(
  "/list-fuels",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const from = req.body.from;
    const to = req.body.to;
    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can list your car's cost only");
    }
    let fuels = await FuelDAO.listByCar(carId, from, to);
    res.json({ fuels });
    next();
  }
);

router.post(
  "/list-fines",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const from = req.body.from;
    const to = req.body.to;
    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can list your car's cost only");
    }
    let fines = await FineDAO.listByCar(carId, from, to);
    res.json({ fines });
    next();
  }
);

router.post(
  "/list-periodics",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const from = req.body.from;
    const to = req.body.to;
    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can list your car's cost only");
    }
    let periodicCosts = await PeriodicCostDAO.listByCar(carId, from, to);
    res.json({ periodicCosts });
    next();
  }
);

router.post(
  "/list-others",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    const from = req.body.from;
    const to = req.body.to;
    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can list your car's cost only");
    }
    let costs = await CostDAO.listOtherCostByCar(carId, from, to);
    res.json({ costs });
    next();
  }
);

router.post(
  "/list-categorized",
  [passport.authenticate("jwt", { session: false }), i18n],
  async (req, res, next) => {
    const carId = req.body.carId;
    from = req.body.from;
    to = req.body.to;
    let car = await CarDAO.getById(carId);
    if (car.userId != req.user.id) {
      throw new Error("You can list your car's cost only");
    }
    let costs = await CostDAO.listCategorizedByCar(carId, from, to);
    res.json({ costs });
    next();
  }
);

module.exports = router;
