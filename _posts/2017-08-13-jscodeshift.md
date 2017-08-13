---
layout: post
title: 利用 AST 对项目代码进行迁移
date: 2017-08-13 14:15:00 +0800
tags: 
    - AST
    - jscodeshift
---

> The more code you have, the harder it becomes to make big, sweeping changes quickly and confidently. Even if you trust yourself not to make too many mistakes, and no matter how proficient you are with your text editor, changing tens of thousands of lines of code takes precious, non-refundable time.

项目写了一段时间之后，如果再进行项目的调整，那往往是比较繁琐的事情，不是在编辑器中使用全文检索和替换能够解决的了。

在看 React 官方文档时，看到他们使用 [react-codemod](https://github.com/reactjs/react-codemod) 来解决 React 版本更新造成的 API 使用的问题，于是看了一下这种方案是如何实现的。

#### [react-codemod](https://github.com/reactjs/react-codemod)

首先 react-codemod 项目提供的仅仅是一些转化的脚本，而这些转化脚本主要是提供给 [jscodeshift](https://github.com/facebook/jscodeshift) 这个工具使用的。

#### [jscodeshift](https://github.com/facebook/jscodeshift)

jscodeshift 的核心则是由 [recast](https://github.com/benjamn/recast) 提供，jscodeshift 对 recast 进行了自己的封装，添加了 `Collection` 类使得对 AST 操作的 API 更加易于使用，也提高了操作的可拓展性，同时该工具也提供了对文件以及文件夹的多线程操作，并可以给出最后转化的结果（成功或失败的文件数）。

#### [recast](https://github.com/benjamn/recast)

recast 这个工具则是核心，其提供了对源码进行 AST 分析以及修改的能力，同时可以最大程度地保留原代码的格式，对于 AST 中没有修改的部分，他会原封不动地进行输出，其也支持对 AST 进行格式化的代码输出，提供了部分可定制的代码格式化选项。

#### API

代码的范例可以参看 react-codemod 项目，由于没有找到详细的 API 文档，这里就列出一部分个人认为比较重要的 API。

- *jscodeshift(code: string)*  
    根据源码 `code` 生成 AST，返回一个 `Collection` 对象。
- *Collection.find(nodeType: ASTTypes, predictor: any)*  
    从 `Collection` 中过滤出所有 `nodeType` 节点类型的节点，返回一个 `Array<NodePath>` 数组可用于迭代。
- *Collection.replace(nodes: NodePath | Array<NodePath>)*  
    用 `nodes` 节点替换 `Collection` 中的**每个** `NodePath`。
- *Collection.insertBefore/Collection.insertAfter(nodes: NodePath | Array<NodePath>)*
    在 `Collection` 中的**每个** `NodePath` 前/后插入 `nodes` 节点。
- *Collection.paths()*  
    获取 `Collection` 中的所有 `NodePath`，返回一个 `Array<NodePath>` 数组。

关于 AST 操作的更多 API 可以参看 [recast](https://github.com/benjamn/recast) 的文档以及 [ast-types](https://github.com/benjamn/ast-types) 的文档以及相关的源码。
