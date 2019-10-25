const passport = require("passport");
const express = require("express");
const router = express.Router();
const config = require("config");

const i18n = rootRequire("middlewares/i18n");

router.get("/app-version", i18n, async (req, res, next) => {
  res.json({ version: config.get("application_version") });
  next();
});

module.exports = router;
