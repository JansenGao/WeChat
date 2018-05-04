var mysql = require('mysql');
var config = require('../config/config');
var logger = require('./logger').logger;
var _ = require('underscore');

env = config.environment;

var pool = mysql.createPool({
    connectionLimit : config[env].db.maxPoolSize,
    host            : config[env].db.host,
    user            : config[env].db.user,
    port            : config[env].db.port || 3306,
    password        : config[env].db.password,
    database        : config[env].db.database
});

exports.DB = DB = function(){
    this.query = function(sql, params, cb){
        if(!_.isArray(params)){
            params = [];
        }
        if(config[env].db.print_sql){
            logger.info("[sqltext] " + sql);
            logger.info("[params] " + params);
        }
        pool.getConnection((err, conn) => {
            if(err){
                logger.error(err);
                return cb(err);
            }
            conn.query(sql, params, (err, results, fields) => {
                conn.release();
                if(err){
                    return cb(err);
                }
                return cb(null, results);
            });
        });
    };
    this.insert = function(table_name,fields,cb){
        var i = 1;
        var params = [];
        var keys = [];
        var param_indexs = [];
        for(var key in fields){
            param_indexs.push("?");
            keys.push(key);
            params.push(fields[key]);
        }
        var sql = "insert into " + table_name + "(" + keys.toString() + ") ";
        sql += " values(" + param_indexs.toString() + ") ";

        if(config[env].db.print_sql){
            logger.info("[sqltext] " + sql);
            logger.info("[params] " + params);
        }

        return this.query(sql,params,function(err,rows){
            if(err) return cb(err);
            return cb(null,rows[0]);
        });
    };

    /**
     * @param  {} table_name 表名:string
     * @param  {} fields set字段列表:{'field_1': 'value1', 'field_2': 'value2' ...}
     * @param  {} conditions where字段列表:{'field_1': 'value1', 'field_2': 'value2' ...}
     * @param  {} cb 回调函数
     */
    this.update = function(table_name,fields,conditions,cb){
        var params = [];
        var i = 1;
        var par = [];

        var tmp_fields = [];
        for(var key in fields){
            var _tmpstr = key + " = ?";
            params.push(fields[key]);  
            tmp_fields.push(_tmpstr);
        }

        var tmp_conditions = [];
        for(var key in conditions){
            var _tmpstr = key + " = ?";
            params.push(conditions[key]);
            tmp_conditions.push(_tmpstr);
        }

        var sql = "update " + table_name + " set " + tmp_fields.toString();
        sql += " where " + tmp_conditions.join(" and ");

        if(config[env].db.print_sql){
            logger.info("update: " + sql);
        }

        return this.query(sql,params,function(err,rows){
            if(err) return cb(err);
            return cb(null,rows);
        });
    };
};
