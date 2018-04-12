const express = require('express');
const config = require('./config/config');
const crypto = require('crypto');

const ENV = "develop";

app = express();

app.get('/', (req, res) => {
    // 1. 获取请求参数
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;

    // 2. 将token,timestamp,nonce三个参数按字典排序
    var array = [config[ENV].wechat.appID, timestamp, nonce];
    array.sort();

    // 3. 将三个参数字符串拼接成一个字符串并进行SHA1加密
    var tmpStr = array.join('');
    const hashCode = crypto.createHash('sha1');
    var result = hashCode.update(tmpStr, 'utf8').digest('hex');

    // 4. 将加密后字符串与signature对比
    if(result == signature){
        res.send('success');
    }else{
        res.send('error');
    }

});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
