var amqplib = require('amqplib');
var config = require('../config/config');
var logger = require('./logger').logger;

config = config[config.environment];

mq_addr = config.rabbitmq.address;

/**
 * @param  {string} queue_name 队列名
 * @param  {object} msg_obj json对象消息
 */
exports.insert_mq = function(queue_name, msg_obj){
    return new Promise((resolve, reject) => {
        queue_msg = new Buffer(JSON.stringify(msg_obj));

        amqplib.connect(mq_addr).then(function(conn){
            return conn.createChannel().then(function(ch){
                var ok = ch.assertQueue(queue_name, {durable: true});

                return ok.then(function(){
                    ch.sendToQueue(queue_name, queue_msg, {deliveryMode: true});
                    ch.close();
		            logger.info('消息队列发送成功');
                    return resolve();
                }).catch(err => {
                    logger.error(err);
                    return reject('消息队列发送出错');
                });
            }).catch(err => {
                logger.error(err);
                return reject('消息队列连接出错');
            });
        }).catch(err => {
            logger.error(err);
            return reject('消息队列地址出错');
        });
    });
};

/**
 * @param  {} queue_name
 */
exports.receive_mq = (queue_name) => {
    return new Promise((resolve, reject) => {
        amqplib.connect(mq_addr).then(conn => {
            return conn.createChannel();
        }).then(ch => {
            return ch.assertQueue(queue_name).then(ok => {
                return ch.consume(queue_name, msg => { // 对消息的处理函数
                    if(msg !== null){
                        ch.ack(msg);
                        return resolve(msg.content.toString());
                    }else{
                        return reject('消息为空');
                    }
                });
            });
        }).catch(err => {
            logger.error(err);
            return reject(err);
        });
    });
};
