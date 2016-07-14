---
layout: post
title: Fiddler前端调试工具快速开始
date: 2016-07-14 16:11:00 +0800
tags: 
    - 前端调试
---

Fiddler是一款微软开发的免费前端调试工具，网络抓包和包分析的功能很强大，而其最强大的功能是可以代理**任何**的网络请求。

这里以 *商户中心* 项目为例演示如何快速使用上该工具。

## Step1: 配置Fiddler

点击Fiddler菜单栏的 **Tools** 选项，按照下图进行配置，配置过程中如果遇到弹窗，点击 **确认**、**允许** 等肯定选项。

![Fiddler Options](/imgs/in-posts/2016-07/fiddler-options.png "Fiddler Options")

## Step2: 配置网络代理

Fiddler默认监听本地的8888端口，因此需要将网络的代理设置进行相应的修改。

打开Internet选项，按照下图进行配置。

![Internet Proxy](/imgs/in-posts/2016-07/fiddler-internet-proxy.png "Internet Proxy")

## Step3: 配置Fiddler代理规则

将需要通过Fiddler代理的文件添加代理规则，如下图所示：

![File Proxy](/imgs/in-posts/2016-07/fiddler-file-proxy.png "File Proxy")

由于代码有版本控制，因此需要用正则表达式对代理的文件名进行匹配，否则每次 `build` 完之后都需要更新文件代理的规则。

## Final: 实战！

稍等！

由于商户中心项目本地开发是分模块的，而测试服务器上的代码是合并过的，因此需要在本地将文件合并之后才能在测试服务器上看到：

进入到 **merchant** 目录下，运行命令 `grunt concat` 就可以得到合并后的文件了。

每次修改之后执行一下上述命令，然后再刷新一下页面就能够在测试服务器上看到最新的修改结果啦！如果嫌每次执行命令麻烦，可以自己在 grunt 里面加一个 watch 任务~

## 更多

关于Fiddler更为详尽的说明可以参照如下网站：

- [Fiddler 官网](http://www.telerik.com/fiddler)
- [Fiddler 教程](http://www.cnblogs.com/TankXiao/archive/2012/02/06/2337728.html#introduce)
- [fiddler2抓包工具使用图文教程 ](http://blog.163.com/hlz_2599/blog/static/142378474201381102837194/)