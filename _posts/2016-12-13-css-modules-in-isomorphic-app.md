---
layout: post
title: Isomorphic App Toast - CSS Modules
date: 2016-12-13 10:26:00 +0800
tags: 
    - CSS Modules
    - Isomorphic App
    - React
---

最近手里的项目终于开始使用 React 进行重构了，当然整体框架选用的是最流行的服务端同构模式。

既然是重构，那必须要解决一些原来项目中的痛点——

1. 原框架虽然也可以实现组件化开发，但对开发人员的要求较高，代码逻辑较为复杂；新框架采用 React 进行组件化开发，在很大程度上减小了开发的难度，降低了代码的复杂性，同时也提高了代码的复用性。
2. 原框架使用 grunt 进行打包发布，随着业务的不断复杂化，打包的单个 js 文件达到了惊人的 1.6MB(gzip后477KB)，严重影响了首屏加载速度；新框架采用 webpack 进行 code splitting，使用 koa 搭建服务端同构 app，首屏加载速度得到了优化。

组件化开发过程中样式表的管理却是非常蛋疼的。一个组件的 HTML 和 JS 都是 scoped，但唯独 CSS 是 global，这样就不得不考虑全局命名冲突已经样式冲突等问题。

于是很自然的就想要引入 [CSS Modules](https://github.com/css-modules/css-modules)。

组件的代码如下：

```
// ChoiceBox.jsx
import React from 'react';
import styles from './style.css';

export default class ChoiceBox extends React.Component {
  render() {
    return (
      <div className={styles.bordered}>
      </div>
    );
  }
}
```

相关的 CSS 代码如下：

```
// style.css
.bordered {
  border: 1px solid #ddd;
  min-height: 60px;
}
```

同时在 webpack loaders 配置中添加相关的 CSS Modules 设置，配置如下：

```
// webpack.config.js
{
    test: /\.css$/,
    loaders: [
      "style-loader",
      "css-loader?modules&localIdentName=[name]__[local]___[hash:base64:5]"
    ]
}
```

这样在 client 端跑起 webpack server，没有任何问题。但是在 server 端并没有使用 webpack 进行打包，因此在解析组件中的样式表引入时，会报语法错误。

于是，在 server 端的 babel 配置中添加 CSS Modules 相关的设置，并保持与 client 端相一致。同时需要注意，该配置只应用于 server 端，而 babel 的配置文件是通用的，所以需要添加环境判断。具体配置如下：

```
// .babelrc
{
  "presets": [
    "es2015",
    "react",
    "stage-1"
  ],
  "plugins": [],
  "env": {
    "development": {
      "presets": [
        "react-hmre"
      ]
    },
    "node": {
      "plugins": [
        ["css-modules-transform", {
          "generateScopedName": "[name]__[local]___[hash:base64:5]"
        }]
      ]
    }
  }
}
```

这样，最后生成的 DOM 结构如下：

```
<div class="style__bordered___Pvrun">
</div>
```

相关参考：

- [SERVERSIDE CSS MODULES WITH BABEL](http://madole.xyz/serverside-css-modules-with-babel/)