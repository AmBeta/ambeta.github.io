---
layout: post
title: 商户中心项目代码结构
date: 2016-04-19 21:39:00 +0800
tags: 
    - MVC
    - Stapes
---

商户中心项目，为商户提供各种订单查询与管理、自助点餐服务配置等功能。

该项目各个模块基本均采用了MVC思想进行搭建，使用了 [Stapes.js](https://github.com/hay/stapes) 这个非常轻量级的MVC框架，配合使用 [handlebars.js](http://https://github.com/wycats/handlebars.js) 进行模版加载，UI方面使用 [bootstrap](http://https://github.com/twbs/bootstrap) 进行布局，可以让前端工程师把更多精力放到业务逻辑上。

项目的打包使用的是 [grunt](https://github.com/gruntjs/grunt) 构建工具。

## 整体结构


## 主要模块

### 订单

- ***order.init.js***  
    各个 order 对象的实例化。  
    `orderQueryModel`: 初始化请求的参数列表、参数值等。
    `orderQueryView`: 初始化各个视图模板与视图元素。
    `orderQueryController`: 初始化。

- ***order.query.model.js***  


- ***order.query.view.js***  
    - `constructor()`  
        调用接口初始化页面模板。
    - `loadTemplates()`  
        载入页面模板。
    - `renderData()`  
        根据不同的页面，调用不同的入口函数生成页面上下文。

- ***order.query.controller.js***
