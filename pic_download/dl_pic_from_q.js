var logger = require('../utils/logger').logger;
var amqplib = require('amqplib');
var rabbimq_util = require('../utils/rabbitmq_util');
var config = require('../config/config');
var request = require('request');
var fs = require('fs');
var path = require('path');
var DB = require('../utils/db_mysql').DB;

config = config[config.environment];
download_path = config.download_path;
download_base_url = config.download_base_url;
const amqp_address = config.rabbitmq.address;

db = new DB();

/**
 * @param  {} msg_json 消息队列订阅的JSON对象
 * @returns Promise对象
 */
function download_from_queue(msg_json){
    return new Promise((resolve, reject) => {
		logger.info(msg_json);

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
 * @param  {} msg_json 消息JSON对象
 * @returns Promise对象
 */
function save_to_db(msg_json){
    return new Promise((resolve, reject) => {
        var sql = 'insert into tb_picstore(formid, url, openid, fromuser,';
        sql += ' timestamp, upd_flg, accept, messageId, messageCreateTime)';
        sql += ' values(?, ?, ?, ?, now(), ?, ?, ?, ?)';
        var params = [];
        params.push(msg_json.messageId);
        params.push(msg_json.downloadUrl);
        params.push(msg_json.openid);
        params.push(msg_json.userName);
        params.push('N');
        params.push('N');
        params.push(msg_json.messageId);
        params.push(new Date(msg_json.createTime * 1000));
    
        db.query(sql, params, (err, results) => {
            if(err){
                return reject(err);
            }
	        logger.info('数据库保存成功');
            return resolve(msg_json); // 继续将msg抛给下一个promise
        });
    });
}

logger.info('消费者进程启动');

require('amqplib/callback_api').connect(amqp_address, (err, conn) => {
	if(err)
		return logger.error(err);
			        
	conn.createChannel((err, ch) => {
		if(err)
			return logger.error(err);
							            
		q = 'in_pic_msg';
		ch.assertQueue(q);
        ch.consume(q, msg => {
            if(msg){
                ch.ack(msg);
                msg_json = JSON.parse(msg.content.toString());
                download_from_queue(msg_json)
                .then(save_to_db)
                .catch(err => {
                    logger.error(err);
                });
            }
        });
    });
});

