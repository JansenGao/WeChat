// 请求(require)一个 nodejs 自带的 http模块
// 请求(require)一个 nodejs 自带的 url解析模块
var http = require("http"),
    url = require("url");
var config = require('../config/config'); 
var logger = require('../utils/logger').logger;

// 调用 http模块 提供的 createServer函数: 
// 返回一个对象,这个对象有一个 listen 方法,这个方法带一个数值参数,
// 指定这个 http 服务器监听的端口号.
var env = config.environment;
var port = config[env].rpa.port;

function start(route, handle) {

    function onRequest(request, response) {
        // 获取请求路径
        var pathname = url.parse(request.url).pathname;

        // 关闭nodejs 默认访问 favicon.ico
        if (!pathname.indexOf('/favicon.ico')) {
            return; 
        };

        // 收到来自 pathname 的请求
        logger.info("Request for " + pathname + " received.");

        // 路由器处理
        route(handle, pathname,request, response);

    }
    logger.info(port);
    http.createServer(onRequest).listen(port);
    logger.info("Server has start!");
}

// 开放接口
exports.start = start;