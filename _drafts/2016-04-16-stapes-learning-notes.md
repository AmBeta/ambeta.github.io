---
layout: post
title: Stapes.js
date: 2016-04-16 18:41:00 +0800
tags: 
    - MVC
    - Stapes
---

## Stapes.extend()

> `Stapes.extend()` can be used for writing extra methods and properties that will be available on all Stapes modules, even after you have created them. This is very useful for writing plugins for functionality that isn't in Stapes.

利用该接口创建针对所有 Stapes 对象的原型方法。

## Stapes._

> All internal methods are available as the `Stapes._` object, so if you want you can overwrite and hack virtually all Stapes behaviour.


## Stapes.mixinEvents([object])

> It's possible to add Stapes' event handling methods to any Javascript object or function. This can be very handy if you want to create an object that only uses event handlers, or for an object or function that already exists and you don't want to convert to a Stapes module.

> You can also add event methods to a function.

`mixinEvents` 可以为任何JavaScript对象添加事件方法，也可以为函数添加，因为JavaScript中的函数也是一种对象，这里对函数的利用更倾向于“类”。

```
function Module(what) {
    this.what = what;
    Stapes.mixinEvents(this);
}
```

> Note that these events are also triggered on the main Stapes object, so you can use `Stapes.on` to catch events from these mixed-in objects as well.

## module.push

`module.push( value, [silent] );`
`module.push( array, [silent] );`

> Sets a value, automatically generates an unique uuid as a key.
