var logger = require('../utils/logger').logger;
var rabbimq_util = require('../utils/rabbitmq_util');
var config = require('../config/config');
var request = require('request');
var fs = require('fs');
var path = require('path');
var DB = require('../utils/db_mysql').DB;

config = config[config.environment];
download_path = config.download_path;
download_base_url = config.download_base_url;

db = new DB();

logger.info('消费者进程启动');

/**
 * @param  {} msg 消息队列订阅的消息
 * @returns Promise对象
 */
function download_from_queue(msg){
    return new Promise((resolve, reject) => {
		    logger.info(msg);
        // 将msg转换为json
        msg_json = JSON.parse(msg);

        url = msg_json.picUrl;
        msgID = msg_json.messageId;
        dest_path = download_path + msgID + '.jpeg';
        logger.info('下载到', dest_path);

        var stream = request(url).pipe(fs.createWriteStream(dest_path));
	msg_json.downloadUrl = download_base_url + msgID + '.jpeg';
        stream.on('finish', () => {
            resolve(msg_json);
        });
        stream.on('error', err => {
            reject(err);
        });
    });
}

/**
 * @param  {} msg_json 消息json对象
 * @returns Promise对象
 */
function save_to_db(msg_json){
    return new Promise((resolve, reject) => {
        var sql = 'insert into tb_picstore(formid, url, openid, fromuser, timestamp, upd_flg, accept) values(?, ?, ?, ?, now(), ?, ?)';
        var params = [];
        params.push(msg_json.messageId);
        params.push(msg_json.downloadUrl);
        params.push(msg_json.openid);
        params.push(msg_json.userName);
        params.push('N');
        params.push('N');
    
        db.query(sql, params, (err, results) => {
            if(err){
                return reject(err);
            }
	    logger.info('数据库保存成功');
            return resolve(msg_json); // 继续将msg抛给下一个promise
        });
    });
}

rabbimq_util.receive_mq('in_pic_msg')
    .then(download_from_queue)
    .then(save_to_db)
    .catch(err => {
        logger.error(err);
    });


