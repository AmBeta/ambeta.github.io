---
layout: post
title: 商户中心常用公共函数与组件
date: 2016-04-19 21:39:00 +0800
tags: 
    - 商户中心
---

商户中心项目中有一些封装好的函数库与UI组件，都比较好用，但是文档维护得比较差，每次要用的时候都需要把源码翻出来看一遍，过段时间又会忘记，因此写个文档记录一下，方便日后查阅，也是吸取一些封装技术的经验吧。

## UI组件

### 提示信息组件 (TopTip)

> **Hualala.UI.TopTip**  
> Constructor: `function TopTip(cfg)`
> Description: Show tip message for model window.  
> Parameters : {[Object]} cfg [configuration]  
> Return     : {[jQuery Object]} [TopTip instance]

`cfg` 支持如下选项——

- **msg** - *{[string]}* - The message to show.
- **type** - *{danger|warning|success}* - The type of TopTip, each in a different color. Default: `'warning'`
- **interval** - *{[number]}* - Time in *ms* before the TopTip disappears.
- **afterClose** - *{[function]}* - This funciton will be called when the TopTip disappears.

示例：

```
var topTip = new Hualala.UI.TopTip({
    msg : 'Server Internal Error!',
    type : 'danger',
    interval : 3000
});
```

### 模态框组件

> **Hualala.UI.ModalDialog**  
> Constructor: `function ModalDialog(cfg)`  
> Description: Show a modal window.  
> Parameters : {[Object]} cfg [configuration]  
> Return     : {[Object]} [modal instance]  

`cfg` 支持如下选项——

- **container**

该构造函数返回的对象包含如下属性——



### 加载进度条组件 (LoadingModal)

> **Hualala.UI.LoadingModal**  
> Constructor: `function LoadingModal(cfg)`  
> Description: Show a loading modal window.  
> Parameters : {[Object]} cfg [configuration]  
> Return     : {[Object]} [loadingModal instance]  

`cfg` 支持如下选项——

- **container** - *{[jQuery Object]}* - The container of this modal. Default: `$('body')`
- **title** - *{[string]}* - Message showing. Default: `'努力加载中...'`
- **modalClz** - *{[string]}* - Classes of this modal. Default: `''`
- **start** - *{[number]}* - Start point of progress bar. Default: `20`
- **progressClz** - *{[string]}* - Classes of the progress bar. Default: `'progress-bar-warning progress-bar-striped active'` 
- **afterShow** - *{[function]}* - This function will be called when the modal shows.
- **afterHide** - *{[function]}* - This function will be called when the modal hides.

该构造函数返回的对象包含如下属性——

- **modal** - *{[Object]}* - An instance of `ModalDialog` (refer to [ModalDialog](#)).  
- **show** - *{[function()]}* - Call this to show the modal.
- **hide** - *{[function()]}* - Call this to hide the modal.
- **updateProgress** - *{[function(curProgress)]}* - Call this with a number to update the progress bar.

示例：

```
var loadingModal = new Hualala.UI.LoadingModal({
    start : 100
});
```


## 公共函数



## 库函数