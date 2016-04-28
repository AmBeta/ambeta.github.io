---
layout: post
title: 移动端的触摸事件接口与常见问题
date: 2016-04-24 22:51:00 +0800
tags: 
    - 响应式设计
---

响应式设计是近几年来的热门和趋势，同一套页面和代码在桌面端与移动端都有非常好的体验确实是很酷的事情。布局方面，使用CSS的百分比属性以及诸如 `em`, `rem` 等相对属性都能取得不错的效果；交互方面，则主要需要注意移动端的**触摸事件**与桌面端**点击事件**的不同。

## 触摸事件API

HTML5中为触摸屏设备新增了触摸事件，提供的接口主要有 `TouchEvent` （触摸状态改变时触发的事件）, `Touch` （用户与触摸屏的一个接触点）以及 `TouchList` （多点触摸时用户与屏幕的所有接触点的集合）。

### 触摸事件的类别

触摸事件主要有 `touchstart`, `touchend`, `touchmove`, `touchcancled` 四种类型，可以通过 `TouchEvent.type` 来检查事件的类型。

#### touchstart

当手指接触屏幕时触发，即使有一只手指已经放在了屏幕上也会触发该事件。  
该事件的 `target` 会被设置为事件触发位置的元素。

#### touchend

当手指离开屏幕时触发，包括抬起手指以及手指从屏幕边缘滑出。  
该事件的 `target` 会被设置为 `touchstart` 事件触发位置的元素，即使 `touchend` 事件触发时的位置已经脱离了原来的元素也一样。

#### touchmove 

当手指在屏幕上移动时触发，当触摸的半径、角度以及力度等发生变化时也会触发该事件。  
与 `touchend` 事件一样，该事件的 `target` 也会被设置为 `touchstart` 事件触发位置的元素。

> **注意：** `touchmove` 事件触发的频率与浏览器以及设备的硬件水平相关，因此不建议依赖该事件进行过细粒度的计算。

#### touchcancel

当触摸被某种方式中断时触发。  
触摸中断的具体原因会根据设备或浏览器的不同而存在差异，一下是一些常见的原因： 

- 有其他事件触发。例如触摸期间弹出提示框。
- 触摸点移出了文档内容区域。例如触摸点移动到了浏览器的UI元素上或者插件等外部内容上。
- 多点触摸时，用户每增加一个触摸点，上一个 `Touch` 就会从 `TouchList` 中取消。

### 触摸事件的属性

一个 `TouchEvent` 中提供了 `altKey`, `changedTouches`, `ctrlKey`, `metaKey`, `shiftKey`, `targetTouches`, `touches` 等属性，其中——

- `changedTouches` 是由多个 `Touch` 对象组成的 `TouchList`，其中保存着相对于上一次触摸事件触发时改变了的触摸点。
- `targetTouches` 是由多个 `Touch` 对象组成的 `TouchList`，其中保存着当前所有触摸点的信息以及触摸起始位置元素的触摸点信息。
- `touches` 是由多个 `Touch` 对象组成的 `TouchList`，其中保存着当前所有触摸点的信息，**不包含**触摸点的变化信息。

*更多详细可参阅：[MDN](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)*

## 触摸事件与点击事件的兼容

在处理元素的点击事件时，一般绑定的是 `click` 事件，但在移动端进行触摸点击操作时会感到明显的延迟（尤其是在iPhone上），这主要是因为在触屏设备上事件的触发顺序不同。

### 事件的触发顺序

在触屏设备上，一次触摸点击的操作会依次触发 `touchstart`, (`touchmove`), `touchend` 以及 `click` 事件。

对于触屏设备而言，有各种多次触摸或者多点触摸的手势，浏览器需要时间对触发的时间进行判断。例如在 iOS 的 Safari 浏览器中，双击屏幕可以进行放大或缩小的操作，因此一次触摸完成后，浏览器需要等待一段时间来判断是否会发生双击触摸时间，如果没有，则触发 `click` 事件，在 iOS 的 Safari 中，从 `touchEnd` 到 `click` 这段时间设置为了 **300ms**，这就是使用 `onClick` 事件带来明显延迟的原因。

### 阻止点击事件触发

为了避免出现网站在触屏设备上的点击延迟问题，可以通过添加对 `touchstart` 或者 `touchend` 事件的监听，并使用 `event.preventDefault()` 来阻止 `click` 事件的触发。示例如下：

```
document.querySelector('#element').addEventListener('click', function (e) {
        // do something
    });
document.querySelector('#element').addEventListener('touchend', function (e) {
        e.preventDefault();
        // do something the same
    });
```

但是这种做法有个问题，当使用 `touchend` 事件时，问题不是很大，但有时为了获得更快的响应速度会选择使用 `touchstart` 事件，添加 `event.preventDefault()` 就会屏蔽掉浏览器的滚动操作，这一点在移动端开发时或许很有用，为了使 WebAPP 有更加接近 NativeAPP 的使用体验，除了禁用页面缩放外，还可以禁用页面滚动操作。

> 使用 FastClick 插件可以较好地解决上述问题：[https://github.com/ftlabs/fastclick](https://github.com/ftlabs/fastclick)

### 检测触摸事件是否支持

如果不做事件的兼容，通过运行一遍脚本来绑定对应的事件也是一种不错的方法。但如果设备既支持点击又支持触摸，那就很蛋疼了（但我相信用苏菲的人不多。。毕竟这样的体验并没有微软想象得那么好）。

#### 利用window对象属性

如上述API所描述的，触屏设备的 `window` 对象中包含了一些原生的触摸事件对象，通过检测这些对象是否存在即可判断出当前设备是否支持触摸操作。

```
if (window.Touch || window.TouchEvent || window.TouchList) {
    alert('You can touch me!');
}
```

#### 利用document对象属性 

支持触摸设备的 DOM 元素上都提供了触摸事件的监听接口，因此，使用如下代码也可以检测设备是否支持触摸操作：

```
if ('ontouchstart' in document || 'ontouchmove' in document || 'ontouchend' in document) {
    alert('Don't touch me anymore!');
}
```

