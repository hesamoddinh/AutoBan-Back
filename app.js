const express = require("express");
const path = require("path");
const config = require("config");

global.rootPath = __dirname;
global.rootRequire = name => require(path.join(__dirname, name));
global.DAOs = rootRequire("startup/DAOs");
process.env.NODE_CONFIG_DIR = path.join(__dirname, "./config");

const errors = rootRequire("middlewares/errors");
let app = express();
rootRequire("startup/logging")();
rootRequire("startup/i18n");
rootRequire("startup/routes")(app);
rootRequire("startup/mkdir")();

const port = config.get("port");

app.use(errors);

app.listen(port, () => {
  console.log("Server started on " + port);
});
