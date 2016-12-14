---
layout: post
title: Isomorphic App Toast - CSS Modules
date: 2016-12-13 10:26:00 +0800
tags: 
    - CSS Modules
    - Isomorphic App
    - react
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

#### 使用 less 或者 sass 

尽管使用 CSS Modules 之后就没有必要使用 less 或者 sass 等类 css 语言了，但是也不免有一些习惯性的问题，这里以 less 为例。

创建如下的钩子脚本：

```
// less-require-hook.js
var less = require('less');

module.exports = function processLess(data, filename) {
  var result;
  less.render(data, {}, function (error, output) {
    result = output.css;
  });
  return result.toString('utf8');
};
```

并在 babel 插件的配置中引入该脚本，同时要**注意将该文件添加到 babel 忽略列表中**：

```
// .babelrc
{
  "presets": [
    "es2015",
    "react",
    "stage-1"
  ],
  "plugins": [
  ],
  "env": {
    "development": {
      "presets": [
        "react-hmre"
      ]
    },
    "server": {
      "plugins": [
        ["css-modules-transform", {
          "generateScopedName": "[name]__[local]___[hash:base64:5]",
          "extensions": [".css", ".less"],
          "preprocessCss": "./less-require-hook.js"
        }]
      ]
    }
  },
  "ignore": ["./less-require-hook.js"]
}
```

#### 关于 CSS Modules 的使用

CSS Modules 是对现有的 CSS 做减法。为了追求简单可控，作者建议遵循如下原则：

- 不使用选择器，只使用 class 名来定义样式，不层叠多个 class，只使用一个 class 把所有样式定义好
- 所有样式通过 composes 组合来实现复用，不嵌套

上面两条原则相当于削弱了样式中最灵活的部分，初使用者很难接受。第一条实践起来难度不大，但第二条如果模块状态过多时，class 数量将成倍上升。

一定要知道，上面之所以称为建议，是因为 CSS Modules 并不强制你一定要这么做。听起来有些矛盾，由于多数 CSS 项目存在深厚的历史遗留问题，过多的限制就意味着增加迁移成本和与外部合作的成本。初期使用中肯定需要一些折衷。幸运的是，CSS Modules 这点做的很好：

**如果我对一个元素使用多个 class 呢？**  
没问题，样式照样生效。

**如果我在一个 style 文件中使用同名 class 呢？**  
没问题，这些同名 class 编译后虽然可能是随机码，但仍是同名的。

**如果我在 style 文件中使用了 id 选择器，伪类，标签选择器等呢？**  
没问题，所有这些选择器将不被转换，原封不动的出现在编译后的 css 中。也就是说 CSS Modules 只会转换 class 名相关样式。

但注意，上面 3 个“如果”尽量不要发生。



#### 相关参考

- [SERVERSIDE CSS MODULES WITH BABEL](http://madole.xyz/serverside-css-modules-with-babel/)
- [CSS Modules - Welcome to the Future](http://glenmaddern.com/articles/css-modules)
- [Inline Styles](https://github.com/AmBeta/react-redux-universal-hot-example/blob/master/docs/InlineStyles.md)
- [Modular CSS with React](https://medium.com/@pioul/modular-css-with-react-61638ae9ea3e#.uqj1r2ceb)
- [CSS Modules 详解及 React 中实践](https://github.com/camsong/blog/issues/5)