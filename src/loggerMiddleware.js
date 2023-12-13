const winston = require("winston");
const logger = require("./logger");

const loggerMiddleware = function (req, res, next) {
  req.logger = logger;
  next();
};

module.exports = loggerMiddleware;