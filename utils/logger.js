var log4js = require("log4js");
var config = require('../config/config');

logger = log4js.getLogger();
env = config.environment;
logger.level = config[env].log_level;

exports.logger = logger;
