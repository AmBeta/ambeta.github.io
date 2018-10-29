#!/bin/sh
#---------------------------------------------------------------- 
# Shell Name：install
# Description：Plug-in install script
# Author：Starry
# E-mail: starry@misstar.com
# Time：2016-11-06 02:30 CST
# Version: 1.6.11.07
# Copyright © 2016 Misstar Tools. All rights reserved.
#----------------------------------------------------------------*/
clear

## Check The Router Hardware Model 
model=$(uname -m)
cd /tmp/
curl -s -k https://mirror1.misstar.com/download/$model/mtinstall -o /tmp/mtinstall
if [ $? != 0 ];then
    curl -s -k https://mirror2.misstar.com/download/$model/mtinstall -o /tmp/mtinstall
    if [ $? != 0 ];then
    	echo "下载程序失败,即将退出"
        exit
    fi
fi
chmod +x /tmp/mtinstall
/tmp/mtinstall