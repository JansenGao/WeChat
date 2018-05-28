var logger = require('../utils/logger').logger;
var rabbimq_util = require('../utils/rabbitmq_util');
var config = require('../config/config');

config = config[config.environment];
download_path = config.download_path;

/**
 * @param  {} url 图片地址
 */
function download_pic(url){
}

rabbimq_util.receive_mq('in_pic_msg')
    .then(msg => {

    }).catch(err => {
        logger.error(err);
    });


