var express = require('express');
var config = require('./config/config');
var log4js = require('log4js');
var util = require('util');
var wechat = require('wechat');
var wechat_util = require('./utils/wechat_util');
var mq = require('./utils/rabbitmq_util');
var redis = require('redis');
var logger = require('./utils/logger').logger;
var DB = require('./utils/db_mysql').DB;
var routesWechat = require('./routes/wechat');

app = express();

var env = config.environment;

app.use(express.query());

// 自动回复
app.all('/', routesWechat.autoReply);

// 公众号后台，所有API需要验证从微信端进入，需要用微信验证中间件
app.all('/wechat/index', routesWechat.middleware_login_wechat);

const PORT = config[env].port;
app.listen(PORT, () => {
	console.log('Server started at http://localhost:%d', PORT);
});
