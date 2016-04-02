---
layout: post
title: react.js学习记录——实现一个简单的消息中心组件
date: 2016-04-01 13:16:00 +0800
tags: 
    - react
---

React作为最近比较火的前端框架，受到越来越多人的关注，其常常与Angular相提并论，但实际上React并不是一个完整的MVC框架，其基本上只做了`V-View`部分的工作。 
 
React核心的**组件思想**大概是其吸引人眼球的主要原因，通过将页面上不同的功能模块转化为组件的方式，达到前端功能模块复用的目的，也是为前端模块化开发提供的一种新的思路。此外，React通过创新的**虚拟DOM技术**在一定程度上减少了对效率影响极大的实际DOM操作，使得页面渲染速度显著提升。

## React简介

React是一个Facebook和Instagram用来创建用户界面的JavaScript库。很多人都将React视为`MVC`中的`V`（视图）。

[React官方说明文档](facebook.github.io/react/docs/)中对开发React这一框架的初衷说明如下——

> We built React to solve one problem:  
> &nbsp;&nbsp;&nbsp;&nbsp;**building large applications with data that changes over time.**

***changes over time （随时间变化）*** 非常精确地点明了React适用的场合，这点在实际使用React解决问题时会领会得更深。

## Hello World!

### 环境搭建

1. **在React官方网站下载框架源文件（[点击下载Starter Kit 0.14.8](http://facebook.github.io/react/downloads/react-0.14.8.zip)），下载到本地后进行解压。**文件目录结构很简单，`build`中存放的是所有的源文件，包括压缩版与未压缩版，`examples`里面是一些示例代码。
2. **安装babel。**  
    使用如下命令在terminal中借助`npm`安装babel工具：  

    ```
    npm install -g babel-cli
    npm install babel-preset-react
    ```

    *注：React使用特殊的**JSX**语法协助开发（当然你也可以不用），React从0.14版开始已经弃用`JSXTransformer.js`，转而使用babel直接编译生成普通的javascript语法的文件，调试性能更高，也更加便于调试。*

### 用React打招呼

首先新建一个`example.js`文件，并输入以下内容：

```
ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('example');
);
```

这里就能看到React所推荐使用的JSX语法，即将JavaScript语句与类似XML的语句融合在一起编写。`ReactDOM.render`方法有两个参数，第一个参数是要构建的组件结构，**注意**这里只能包含一个闭合标签，若有多个闭合标签形成组合，需要在最外层包裹一个闭合标签；第二个参数是一个DOM元素，用来作为React渲染组件的容器。  

将这个文件直接交给浏览器是无法执行的，因为浏览器原生是不支持这种JSX语法的。这时就需要用到`babel`这个工具将文件转化为标准的JavaScript语法了，在命令行中键入以下命令——

```
babel --presets react src --watch --out-dir build
```

上述命令可将`src`文件夹下的所有文件转化为标准JavaScript语法的文件并按照原来的目录结构输出到`build`文件夹中。`--watch`选项可以让babel监听目录中的文件，并在文件发生变化时立即将文件编译输出。这样我们就得到了`/build/example.js`文件了。

接着建立一个`index.html`文件并输入以下内容：

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Hello React!</title>
        <script src="build/react.js"></script>
        <script src="build/react-dom.js"></script>
    </head>
    <body>
        <div id="example"></div>
        <script src="build/example.js"></script>
    </body>
</html>
```

这里要注意的是，**`example.js`的引入需要在`<body>`标签的尾部**，否则将会出现找不到id为example的`<div>`标签的问题。

OK，现在打开`index.html`就能够看到`Hello, world!`字样了！

## Demo: 消息中心组件

React官方说明文档中有两个实例，一个是类似于Facebook评论模块的实例，实现了评论列表的展示、刷新以及新评论的添加等功能（详见[Totorial](http://facebook.github.io/react/docs/tutorial.html)），该实例包含了React中最基本的一些方法的使用；另一个实例实现了一个简单的带有搜索功能的列表（详见[Thinking in React](http://facebook.github.io/react/docs/thinking-in-react.html)），该实例主要展示了如何利用React的**组件思想**来进行模块的设计。  

看完了两个实例之后，对React的使用就基本上掌握了，同时也对React所倡导的组件思想感觉耳目一新，摩拳擦掌，跃跃欲试。下面就跟着 *Thinking in React* 的思路来创建一个消息中心组件。

### Step 0: 组件功能构想

具有社交功能的网站上，往往有一个消息通知的功能模块，其会集中所有的未读消息，用户可以查看消息，或者将消息标记为已读状态。大概长得跟下面这样（UI比较朴实请无视）：  

![消息中心组件](/imgs/in-posts/2016-04/message-center.png "消息中心组件")  

服务器端的JSON API给我们返回的数据格式如下：

```
[
  {"id": "1", "timestamp": "1459444194796", "sender": "Andy", "content": "Do you mean Peter is a Git?"},
  {"id": "2", "timestamp": "1459445194796", "sender": "Peter", "content": "I'm Gifted actually."}
];
```

### Step 1: 将UI元素拆分为组件

将UI元素拆分为组件时需要保证每个组件的功能是最小的功能集合。这里，显然最外层有一个**消息容器（Message Box）**组件，其中容纳了所有的消息；这个容器包裹着一个**消息列表（Message List）**组件，其中包含了所有的**消息条目（Message Item）**组件，每一个消息条目中包含了消息的发送者（sender）、发送时间（timestamp）以及消息内容（content），同时还包含了一个可以将该条消息标记为已读的按钮。根据上述的划分思路，可以简单地绘制出整个消息中心组件的结构草图：

![消息中心设计草图](/imgs/in-posts/2016-04/design-draft.png "消息中心设计草图")

整个消息中心组件的层级结构如下：

- 消息容器 `MessageBox`
    - 消息列表 `MessageList`
        - 消息条目 `MessageItem`

### Step 2: 实现各级组件的静态功能

实现各级组件的静态时主要需要确定从父组件向自组件传递的数据，即通过`props`传递的数据。

```
var MessageItem = React.createClass({
  render: function() {
    return (
      <div className="msgItem">
        <div className="msgItemHeader">
          <span className="msgSender">
            {this.props.msgSender}
          </span>
          <span className="msgTime">
            {this.props.timestamp}
          </span>
        </div>
        <div className="msgItemInner">
          <div className="msgContent">
            {this.props.children}
          </div>
          <a href="#" className="hasReadBtn">
            标为已读
          </a>
        </div>
      </div>
    );
  }
});

var MessageList = React.createClass({
  render: function() {
    var that = this;
    var messageNodes = this.props.data.map(function(message) {
      return (
        <MessageItem msgId={message.id} 
                     msgSender={message.sender} 
                     msgTime={message.timestamp}
                     key={message.id}>
          {message.content}
        </MessageItem>
      );
    });
    return (
      <div className="msgList">
        {messageNodes}
      </div>
    );
  }
});

var MessageBox = React.createClass({
  render: function() {
    return (
      <div className="msgBox">
        <MessageList data={this.props.data} />
      </div>
    );
  }
});

ReactDOM.render(
  <MessageBox data={data} />,
  document.getElementById('container')
);
```

其中，`data`是一个存储着JSON数据的变量，实际应用时应该通过向服务器端的JSON API请求来获取这部分数据，这里暂且用变量代替主要是为了确认数据绑定是否正常生效。

上面的代码完成了从`MessageBox`到`MessageList`再到`MessageItem`的单向数据传递，`data`中存放的数据在一层层的数据传递过程中被逐步解析和展示出来。这里体现出了React组件思想的优势——数据结构清晰，数据流向明确，外部调用该组件时只需传入需要展示的数据集而完全不需要操心数据在组件内部的传递和展示方式。  

### Step 3: 数据的动态变化与展示

React组件通过`state`来动态地调整数据的展示。当调用组件上的`setState(data, callback)`方法更新`state`时，React会自动调用组件自身的`render`方法对视图进行重绘。在进行视图重绘的过程中，React会首先构建出虚拟DOM树，并与变化前的虚拟DOM树进行对比，计算出差异的部分，然后更新这部分差异所对应的实际DOM节点，从而提高了页面渲染的速度。  

选择组件中合适的数据作为`state`是至关重要的，其**原则是要使得作为`state`的数据尽可能的少**。关于 *Which piece of data should be state?（哪些数据应该作为state？）* 的问题React官方说明文档给出的提示如下：  

> 1. Is it passed in from a parent via props? If so, it probably isn't state.  
> 是否是通过props从父元素获取的？如果是的话，这可能不是state。
> 2. Does it change over time? If not, it probably isn't state.  
> 是否随时间变化？如果不是的话，这可能不是state。
> 3. Can you compute it based on any other state or props in your component? If so, it's not state.  
> 能否通过组件中的其它state或者props计算出来？如果是的话，这可能也不是state。

而关于 *What components should have state?（哪些组件需要state？）* 的问题，官方给出的回答如下：  

> A common pattern is to create several stateless components that just render data, and have a stateful component above them in the hierarchy that passes its state to its children via props. The stateful component encapsulates all of the interaction logic, while the stateless components take care of rendering data in a declarative way.  
> 常用的一种设计模式是构建多个没有state的组件仅用于数据渲染，并构建一个具有state的公共父组件将state中的数据通过props传递给各个子组件。这个具有state的组件包含了所有的交互逻辑，而这些不具有state的组件则负责以一种宣告式的方式渲染数据。

这里，我们选择将`data`作为`state`并将其置于MessageBox这一组件之中，当获得到新的消息时，`state`更新，MessageList和MessageItem通过`props`从MessageBox处获取到新的数据并更新视图。MessageBox中的相关代码如下：  

```
var MessageBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },

  render: function() {
    ...
  }
});
```

### 事件触发与回调

当点击MessageItem上的 *标为已读* 按钮时应触发组件状态的变化，但MessageItem组件上并没有`state`，因此其需要通过回调函数来触发其父组件MessageList的状态更新。而同样，MessageList上也没有定义`state`，于是其进一步通过回调函数触发其父组件MessageBox上的`state`进行更新。相关的代码如下：

```
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var MessageItem = React.createClass({
  handleMsgHasRead: function(e) {
    this.props.onMsgHasRead(this.props.msgId);  // 触发回调
  },

  render: function() {
    return (
      <div className="msgItem">
        <div className="msgItemHeader">
          <span className="msgSender">
            {this.props.msgSender}
          </span>
          <span className="msgTime">
            {this.props.timestamp}
          </span>
        </div>
        <div className="msgItemInner">
          <div className="msgContent">
            {this.props.children}
          </div>
          <a href="#" className="hasReadBtn" 
                  onClick={this.handleMsgHasRead}>  // 绑定onclick事件
            标为已读
          </a>
        </div>
      </div>
    );
  }
});


var MessageList = React.createClass({
  handleMsgHasRead: function(msgId) {
    this.props.onMsgHasRead(msgId);  // 触发回调
  },

  render: function() {
    var that = this;
    var messageNodes = this.props.data.map(function(message) {
      return (
        <MessageItem msgId={message.id} 
                     msgSender={message.sender} 
                     msgTime={message.timestamp}
                     onMsgHasRead={that.handleMsgHasRead} // 为子组件提供回调入口
                     key={message.id}>
          {message.content}
        </MessageItem>
      );
    });
    return (
      <div className="msgList">
        {messageNodes}
      </div>
    );
  }
});


var MessageBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },

  handleMsgHasRead: function(msgId) {
    var i, len, newData;

    newData = this.state.data.concat([]);
    for (i = 0, len = newData.length; i < len; i++) {
      if (newData[i].id == msgId) {
        newData.splice(i, 1);
        break;
      }
    }
    this.setState({data: newData});  // 更新state，触发重绘
    
  render: function() {
    return (
      <div className="msgBox">
        <MessageList data={this.state.data} 
                     onMsgHasRead={this.handleMsgHasRead} />
      </div>
    );
  }
});
```

至此，消息中心组件的构想功能已经全部实现了，将组件的数据获取方式更改为AJAX请求方式并添加轮询操作即可实现消息的及时通知，在此不做赘述，详见GitHub仓库[完整源码](https://github.com/AmBeta/ReactDemo-MessageBox)。

### 添加动画

为了提高用户交互体验，尝试为消息的添加与移除增加动画效果，在MessageList组件中做如下的修改：

```
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var MessageList = React.createClass({
  handleMsgHasRead: function(msgId) {
    this.props.onMsgHasRead(msgId);
  },

  render: function() {
    var that = this;
    var messageNodes = this.props.data.map(function(message) {
      return (
        <MessageItem msgId={message.id} 
                     msgSender={message.sender} 
                     msgTime={message.timestamp}
                     onMsgHasRead={that.handleMsgHasRead} 
                     key={message.id}>
          {message.content}
        </MessageItem>
      );
    });
    return (
      <div className="msgList">
        <ReactCSSTransitionGroup 
          transitionName={{
            enter: 'msgItemEnter',
            enterActive: 'msgItemEnterActive',
            leave: 'msgItemLeave',
            leaveActive: 'msgItemLeaveActive',}} 
          transitionEnterTimeout={300} 
          transitionLeaveTimeout={300}>
          {messageNodes}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});
```

可以看到，所做的修改就是引入了`ReactCSSTransitionGroup`组件，并将`{messageNodes}`放在了`<ReactCSSTransitionGroup>`标签中。

`ReactCSSTransitionGroup`是React插件中提供的一个高级API，用于在元素从DOM树中添加或删除时增加CSS3动画效果。其会在元素**绘制前**给给元素加上`enter`（或`leave`）所指定的CSS类，并在**绘制时**加上`enterActive`（或`leaveActive`）所指定的CSS类。

需要**注意**的是，在js文件和css文件中都需要指定动画的执行时间，`transitionEnterTimeout`和`transitionLeaveTimeout`用于告诉React在什么时候移除元素上的动画类。

## 小结

使用React构建出的组件结构简单明了，数据流向非常清晰。  
但由于其使用的特殊的JSX语法，使得脚本在调试时变得比较困难，尽管使用babel工具可以将其转换为标准的JavaScript语法，但报错仍显得扑朔迷离。  
此外，使用React处理逆向数据流（从子组件到父组件方向的数据传递）时，过程比较繁琐，虽然可以不用过于担心由此造成的性能问题（React提醒不必怀疑JavaScript的执行速度）。