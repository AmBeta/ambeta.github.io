---
layout: post
title: 在Stapes框架下实现一个模态框的实践方法
date: 2016-07-04 18:38:00 +0800
tags: 
    - MVC
    - Stapes
---

使用Stapes创建一个基于MVC的数据列表页面时，页面的MVC逻辑比较清晰——所有的数据条目是一个 `Model`，列表的展示是对应的 `View`，`Controller` 则将视图的事件转化为对数据模型的操作。

对于列表中的每一条数据，由于其是一个独立的数据，因此可以建立一个数据模型用来存储，点击之后弹出模态框，对于这个模态框的设计，如何能保证清晰的逻辑呢？

假设列表的 MVC 实现代码如下：

```
/* List Model */
var DataModel = Stapes.subclass({
    constructor : function (cfg) {
        // initialize...
    }
});
DataModel.proto({
    updateData : function (params) {
        // ajax request
    }
});

/* List View */
var DataView = Stapes.subclass({
    constructor : function (cfg) {
        this.model = cfg.model || null;
        this.$body = cfg.body || $('body');
        
        this.render();
        this.bindEvents();
    }
});
DataView.proto({
    render : function () {},

    bindEvents : function () {
        this.$body.on('click', 'button', function () {
            var modal = new SomeModal({});
        });
    }
});

/* List Controller */
var DataController = Stapes.subclass({
    constructor : function (cfg) {
        this.model = cfg.model || null;
        this.view = cfg.view || null;
        if (!this.model || !this.view) {
            throw ('DataController init failed!');
        }

        bindEvents();
    }
});
DataController.proto({
    // bind model events
    this.model.on({
        update : function (params) {
            this.model.updateData(params);
        }
    }, this);
    
    // bind view events
    this.view.on({
        update : function (params) {
            this.model.emit('update', params);
        }
    }, this);
});

```

## 仅供查看数据的模态框

仅供查看数据的模态框是比较容易处理的，这时模态框就是一个单纯的 `View`，其绑定的数据模型就是列表中的那一条数据。

```
var InfoModal = Stapes.subclass({
    constructor : function (cfg) {
        this.model = cfg.model || null;
    }
});
```


## 新增或修改数据的模态框

对于新增或者修改的模态框，情况就比较复杂了，因为用户可以在模态框中对用户的数据进行操作。

根据 MVC 的思想，我们要尽量避免在 `View` 中对数据模型进行直接的操作，`View` 应该通过发出事件的方式让 `Controller` 去捕捉并操作 `Model`，但是用一个完整的 MVC 去实现一个简单的模态框未免太过周折，并且两个 `Controller` 之间的通讯问题会把逻辑绕得更加复杂。

如何写出一个逻辑清晰的模态框组件，总结了有下面几个思路：

- 直接操作数据模型
- 提供回调
- 绑定父视图

### 直接操作数据模型

说是直接操作 `Model`，但也是通过事件机制与 `Model` 进行通讯的，但是由于模态框没有自己的 `Controller`，只能够直接发出 `Model` 上的事件，因此这种事件机制与直接操作 `Model` 并无太大的区别。


另一种情况是，我们需要在模态框中直接操作另一组数据。


### 提供回调

我们可以为调用该模态框的视图提供一个回调，将用户在模态框中对数据的修改以参数的方式传回。

用这种方式实现的模态框逻辑很简单，只需要将 `Model` 中的数据表现出来，然后再将用户的输入传回就好了，不需要关心对 `Model` 的具体操作与结果。

```
var EditModal = Stapes.subclass({
    constructor : function (cfg) {
        this.model = cfg.model || null;
        this.cbFn = cfg.cbFn || function () {};
        
        this.$body = null;  // get initialized in `render()`

        this.render();
        this.bindEvents();
    }
});
EditModal.proto({
    bindEvents : function () {
        var self = this;
        self.$body.on('click', '.btn-ok', function () {
            var params = self.getPostParams();
            self.cbFn.call({}, params);
        });
    }
});
```

这时，在列表视图中，可以这样新建一个模态框：

```
var self = this;    // `this` points to the list view
var modal = new EditModal({
    model : dataModel,
    cbFn : function (params) {
        self.emit('update', params);
    }
});
```


### 绑定父视图

有时在模态框中的操作过于复杂，需要提供多个回调，这样就可以将父视图绑定到这个模态框上，这个模态框就相当于其父元素的一个组成部分，其可以触发父元素上的事件。

```
var EditModal = Stapes.subclass({
    constructor : function (cfg) {
        this.model = cfg.model || null;
        this.parentView = cfg.parentView || null;
    
        this.$body = null;  // get initialize in `render()`

        this.render();
        this.bindEvents();
    }
});
EditModal.proto({
    bindEvents : function () {
        var self = this;
        self.$body.on('click', '.btn-ok', function () {
            var params = self.getPostParams();
            self.parentView.emit('update', params);
        });
    }
});
```

#### 更多

- 使用 ember.js 创建一个模态框的讨论：  
    http://discuss.emberjs.com/t/modal-views-can-we-agree-on-a-best-practice/707/5