---
layout: post
title: jekyll + gh-pages搭建个人博客常见问题记录
date: 2016-03-28 02:17:00 +0800
tags: 
    - jekyll
---

### jekyll本地调试与gh-pages实际显示不一致

> Q: 使用`jekyll serve`命令在本地查看站点一切正常，但提交到gh-pages之后无法正常显示。  
> A: 推荐使用与gh-pages相同的jekyll版本进行本地调试，即通过命令`bundle exec jekyll build --safe`进行本地编译，并通过`bundle exec jekyll serve`命令来进行本地页面调试。

将本地jekyll环境配置与gh-pages服务器端的相同步，可以最大程度地降低本地调试出现问题的可能，主要可通过以下手段来保证本地与远端访问体验相一致。

* 安装GitHub Pages Gem。
* 通过`bundle exec jekyll build --safe`命令可依采用与gh-pages相同的页面生成方式生成你自己的页面。
* 定期使用`bundle update github-pages`或简单地采用`bundle update`来确保gem维持在最新的版本。

*更多详细请参阅：[GitHub Help - Setting up your Pages site locally with Jekyll](https://help.github.com/articles/setting-up-your-pages-site-locally-with-jekyll/)。*

### jekyll时区设置及post发布时间设置

> Q: post文件生成正常，但无法在站点主页中显示；post显示的时间不正确。  
> A: 在post文件的YAML头部中的`date`属性中加上时区信息，**同时**，在站点配置文件`_config.yml`中加上时区配置。

jekyll中post的时间默认是由文件名确定的，但如果在post中YAML头部添加了`date`属性，则post的时间由该属性值 *唯一* 确定。

`date`属性值的格式如下：

```
date: year-month-date [hour:minute:second] [timezone]
```

例如`2016-03-28`, `2016-02-22 22:22:22`, `2016-01-11 11:11:11 +0800`都是有效的时间格式。但jekyll在生成可访问的站点时仅会根据日期来分配页面的地址，具体的时间以及时区信息会对日期的计算产生影响。
  
在不输入`[timezone]`的情况下，jekyll默认使用的是UTC时间，这样就有可能出现post的时间对于gh-pages服务器来说处于未来，从而拒绝编译产生页面。例如我在凌晨发布了一篇post并将时间设置为当地时间`2016-03-28`，而由于我在东八区（`timezone +0800`），实际上UTC时区仍在前一天，因此提交编译之后服务器判定该post的时间处于未来而拒绝编译，也就无法在生成的站点中看到该文了。

于是尝试给post中的时间加上时区信息，提交修改。OK，这样post在站点中可以看到了，但是时间不正确，提前了一天。这是因为站点的时间仍然时UTC时区的，站点编译时根据post中的时区信息将post的时间修正到了UTC时区的时间。

于是再次尝试在站点配置文件`_config.yml`中加上时区配置信息如下：

```
timezone: Asia/Shanghai
```

提交修改，再次打开站点，OK，post显示出来了，而且post的日期也是正确的了。

***注意:*** *GitHub Pages已于2016年2月将其jekyll版本升级到了Jekyll 3.0版本，其支持在`_config.yml`文件中加入`future:true`选项以显示时间处于“未来”的post。更多详细可以参考：[GitHub Pages now faster and simpler with Jekyll 3.0](https://github.com/blog/2100-github-pages-jekyll-3)以及[Upgrading from 2.x to 3.x](http://jekyllrb.com/docs/upgrading/2-to-3/)。*