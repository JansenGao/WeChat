var querystring = require('querystring');
var url = require('url');  
var config = require('../config/config'); 

var logger = require('../utils/logger').logger;

var mq = require('../utils/rabbitmq_util');

//SQL 
var DB = require('../utils/db_mysql').DB;
var DBobj = new DB();

//App_token
var env = config.environment;
var appToken =  config[env].rpa.app_token;


// 存放不同的处理程序，和请求的URL相对应
function imageList(request, response) {
    logger.info("Request handler 'imageList' was called.");
    //获取Get的参数
    var query = url.parse(request.url, true).query;
    var paraResult = getParaValue(query,"app_token");
    var imageResult = {"success": true,"msg": null};


    if (paraResult.success == false)
    {
         // 返回401 错误
        var errMsg = "lack input parameter!";
        writeError(response,errMsg);
        return;
    }
    if (!checkToken(paraResult.value))
    {
        var errMsg= 'UnVaild Token !';
        writeError(response,errMsg);
        return;
    }

    var sqlQuery = "select formid,url,openid,fromuser,DATE_FORMAT(timestamp,'%Y-%m-%d %H:%i:%s') as timestamp  from tb_picstore where (upd_flg = 'N' or upd_flg is null) LIMIT 100";
    logger.info(DBobj.query);
    DBobj.query(sqlQuery,null,function (err, result) {
    if(err){
        var errMsg= '[SELECT ERROR] - '+err.message;
        writeError(response,errMsg);
        return;
        }
    
        imageResult["data"]=result;
        response.writeHead(200, {"Content-type": "text/plain"});
        logger.info(imageResult);
        response.write(JSON.stringify(imageResult));
        response.end();   
    });
}

function result(request, response) {
    console.log("Request handler 'result' was called.");
    //获取POST的参数
    var body;
    var postdata = "";  
    var suceessRes = {"success": true, "value": ''};

    request.on("data",function(postchunk){  
        postdata += postchunk;  
    });  
    request.on("end",function(){  
        body =  querystring.parse(postdata);
        logger.info({"body:":body});
        var paraResult = getParaValue(body,"app_token");

        if (paraResult.success == false)
        {
            // 返回401 错误
            var errMsg = "lack input parameter!";
            writeError(response,errMsg);
            return;
        }

        if (!checkToken(paraResult.value))
        {
            var errMsg= 'UnVaild Token !';
            writeError(response,errMsg);
            return;
        }

        var formidNode =getParaValue(body,"formid");
        if (formidNode.success == false)
        {
            var errMsg = "lack input parameter!";
            writeError(response,errMsg);
            return;
        }

        var acceptNode =getParaValue(body,"accept");
        if (acceptNode.success == false)
        {
            var errMsg = "lack input parameter!";
            writeError(response,errMsg);
            return;
        }
            
        
        var updateValie = {'upd_flg': 'Y', 'accept': acceptNode.value};
        var conditionValie = {'formid': formidNode.value};
        var affectedRows = 0;
        
        DBobj.update('tb_picstore',updateValie,conditionValie,"(upd_flg is null or upd_flg = 'N')",function (err, result) {
            if(err){
                  var errMsg = '[UPDATE ERROR] - '+err.message;
                  writeError(response,errMsg);
                  return;
            }      
            affectedRows = result.affectedRows;   
       
            if (affectedRows==0)
            {
                var errMsg = 'affectedRows is 0';
                writeError(response,errMsg);
            }else
            {
            //往Rbiiitmq队列插入数据
            var errMsgDB = "数据库出错";
            var message = {openid:"",messageId:"",messageCreateTime:null};
            var user = {userEid:"",userEmail:"",userName:""};
            var sql = 'select openid,messageId,messageCreateTime from tb_picstore where formid = ?';
            DBobj.query(sql, [formidNode.value], (err, result) => {
            if(err){
                    logger.error(err);
                    writeError(response,errMsgDB);
                    return;
                }
                for (var i = 0; i < result.length; i++) {
                message.openid = result[i].openid;
                message.messageId=result[i].messageId;
                message.messageCreateTime= result[i].messageCreateTime;
                break;
                }
                sql = 'select * from t_wechat_user where openid = ? and active = 1';
                DBobj.query(sql, [message.openid], (err, result) => {
                if(err){
                        logger.error(err);
                        writeError(response,errMsgDB);
                        return;
                        }
                if(!result.length){
                    logger.info('找不到用户');
                    return;
                    }else{
                    for (var i = 0; i < result.length; i++) {
                        user.userEid = result[i].eid;
                        user.userEmail=result[i].email;
                        user.userName= result[i].name;
                        break;
                        }
                        insert_rpa_conf_msg(message,user);
                    }
                });
            });

                logger.info(suceessRes);
                response.writeHead(200, {"Content-type": "text/plain"});
                response.write(JSON.stringify(suceessRes));
                response.end();
            }              
         });
    
    });  
}

function error(pathname,request, response) {
    logger.info("Request handler 'error' was called.");
    // 返回401 错误
    var errMsg = pathname + " Cannot reach";
    writeError(response,errMsg);
}

function writeError(response,errMsg)
{
    var errorData = {"success": false, msg: ''};  
    logger.info(errMsg);
    response.writeHead(401, {"Content-type": "text/plain"});
    errorData.msg =errMsg;
    response.write(JSON.stringify(errorData));
    response.end();
}

function getParaValue(paralist,key)
{
    var result=  {"success": false, "value": ''};
    logger.info(paralist);
    for(var item in paralist){  
        logger.info(item);
        if(item==key){  //item 表示Json串中的属性，如'name'  
            result.value=paralist[item];//key所对应的value  
            result.success = true;
            break; 
        }  
    }
    return result;
} 

function checkToken(app_token)
{
    if (app_token == appToken)
    {
        return true;
    }
    return false;
}
function insert_rpa_conf_msg (message, user){
    var now=Math.round(new Date().getTime()/1000);
    var rdMQJson =  {
        openid: message.openid,
        userEid: user.userEid,
        userEmail: user.userEmail,
        userName: user.userName,
        messageId: message.messageId,
        messageCreateTime:message.messageCreateTime,
        confirmTime: now,
        userMessage: "你的表单已被录入系统"
    };
    logger.info(rdMQJson);
    return mq.insert_mq('rpa_conf_msg', rdMQJson);
}

exports.imageList = imageList;
exports.result = result;
exports.error = error;