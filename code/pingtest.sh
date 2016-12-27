#!/bin/bash
while [ '1' = '1' ];do 
ping -c 1 ip.cn &> /dev/null
if [ $? -ne 0 ];then
    ping -c 1 baidu.com &> /dev/null
    if [ $? -ne 0 ];then
        zjuvpn -d
        zjuvpn
    fi
fi
date
sleep 120
done
