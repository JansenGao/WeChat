微信普通消息：
当普通微信用户向公众账号发消息时，微信服务器将POST消息的XML数据包到开发者填写的URL上。
图片消息
<xml> <ToUserName>< ![CDATA[toUser] ]></ToUserName> <FromUserName>< ![CDATA[fromUser] ]></FromUserName> <CreateTime>1348831860</CreateTime> <MsgType>< ![CDATA[image] ]></MsgType> <PicUrl>< ![CDATA[this is a url] ]></PicUrl> <MediaId>< ![CDATA[media_id] ]></MediaId> <MsgId>1234567890123456</MsgId> </xml>
参数	描述
ToUserName	开发者微信号
FromUserName	发送方帐号（一个OpenID）
CreateTime	消息创建时间 （整型）
MsgType	image
PicUrl	图片链接（由系统生成）
MediaId	图片消息媒体id，可以调用多媒体文件下载接口拉取数据。
MsgId	消息id，64位整型



验证消息来自微信服务器：
开发者提交信息后，微信服务器将发送GET请求到填写的服务器地址URL上，GET请求携带参数如下表所示：

参数	描述
signature	微信加密签名，signature结合了开发者填写的token参数和请求中的timestamp参数、nonce参数。
timestamp	时间戳
nonce	随机数
echostr	随机字符串
开发者通过检验signature对请求进行校验（下面有校验方式）。若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，成为开发者成功，否则接入失败。

1）将token、timestamp、nonce三个参数进行字典序排序 2）将三个参数字符串拼接成一个字符串进行sha1加密 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
