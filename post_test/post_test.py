#!usr/bin/env python3
# -*- coding: utf-8 -*-

import random
import asyncio
import hashlib
import logging
import aiohttp
import time

logging.basicConfig(level=logging.INFO,#控制台打印的日志级别
                    filename='post_test.log',
                    filemode='w',  # 模式，有w和a，w就是写模式，每次都会重新写日志，覆盖之前的日志
                    # a是追加模式，默认如果不写的话，就是追加模式
                    format=
                    '%(message)s'
                    # 日志格式
                    )


def wx_encrypt():
    global token, timestamp, nonce
    tmpstr = ""

    tmparr = sorted([token, timestamp, nonce])

    for i in tmparr:
        tmpstr = tmpstr + i

    return hashlib.sha1(tmpstr.encode(encoding='utf-8')).hexdigest()


def generate_xml(i):
    index = i % 10
    createtime = time.time()
    msgid = random.randint(10**64, 10**65)
    post_xml = xml_base.format(ToUserName, FromUserName, createtime, PicUrl[index], msgid)
    return post_xml


async def get(i):
    async with aiohttp.ClientSession() as session:
        async with session.get(server_url) as response:
            print(response.status)
            text = await response.text()
            print(text)
            print("done : {}".format(i))


async def post(i, post_xml):
    global global_log
    async with aiohttp.ClientSession() as session:
        async with session.post(server_url, data=post_xml) as response:
            # print(response.status)
            text = await response.text()
            # print(text)
            # print("done : {}".format(i))
            str = "Post {} done at {},status = {} , text = {} ".format(i + 1, time.asctime(), response.status, text)
            print(str)
            return str


if __name__ == '__main__':
    # Wechat validation set up:
    token = "GOwGeX4W1zALm2TER3TLkBOW6it3Gu3ZTAsHgdyNIWN"
    timestamp = str(time.time())
    nonce = str(random.randint(1, 10000))

    # URL set up:
    url_base = "http://jansenubuntu.cloudapp.net/wechat"
    xml_base = "<xml><ToUserName><![CDATA[{}]]></ToUserName>\
    <FromUserName><![CDATA[{}]]></FromUserName><CreateTime>{}</CreateTime>\
    <MsgType><![CDATA[image]]></MsgType><PicUrl><![CDATA[{}]]></PicUrl>\
    <MediaId><![CDATA[media_id]]></MediaId><MsgId>{}</MsgId></xml>"
    ToUserName = "WeChatDemo"
    FromUserName = "python_post_test"
    PicUrl = ["http://pic.58pic.com/58pic/15/42/47/79h58PICG4y_1024.png",
              "http://i2.hdslb.com/bfs/archive/2209be24c1a5c0684a4b0771d04ce39b61e9db1a.jpg",
              "http://img.zcool.cn/community/01614856cddaa06ac7252ce6c3d096.jpg@1280w_1l_2o_100sh.jpg",
              "http://img3.imgtn.bdimg.com/it/u=4069947698,635280143&fm=214&gp=0.jpg",
              "http://img.zcool.cn/community/031a5a156e3f60900000170f27ccb54.jpg@260w_195h_1c_1e_1o_100sh.jpg",
              "http://xqimg.imedao.com/14f6ed7177a5d3fc0911b7c0.jpg",
              "http://images.cnitblog.com/blog/582939/201411/121511245385501.jpg",
              "http://img4.duitang.com/uploads/blog/201407/07/20140707145826_N5jCW.thumb.700_0.jpeg",
              "http://img.zcool.cn/community/013d6c5a0f3f6fa80121985c1aebe6.jpg@1280w_1l_2o_100sh.jpg",
              "http://imglf1.ph.126.net/DFjfshGJnKo3iQOaV7Gxtg==/6608476100282550148.jpg"]

    url_params = "?signature={}&timestamp={}&nonce={}".format(wx_encrypt(), timestamp, nonce)
    server_url = url_base + url_params

    loop_times = ""
    while not isinstance(loop_times, int):
        tmp = input("Please input test times: ")
        if not tmp.isdigit():
            print("please input int value")
        else:
            loop_times = int(tmp)

    logging.info("Post Test Start at {} ".format(time.asctime()))
    logging.info("Total {} times test ".format(loop_times))

    loop = asyncio.get_event_loop()
    tasks = [post(i, generate_xml(i)) for i in range(loop_times)]
    start = time.time()
    result = loop.run_until_complete(asyncio.wait(tasks))
    end = time.time()
    loop.close()

    print("{} Post test use time {} s".format(loop_times, end-start))
    logging.info("{} Post test use time {} s".format(loop_times, end-start))
    logging.info("Post Test End at {} ".format(time.asctime()))
