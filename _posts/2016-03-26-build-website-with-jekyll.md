---
title: 如何使用jekyll建站
date: 2016-03-27 23:35:00 +0800
layout: post
tags:
    - jekyll
---

终于把自己的个人博客折腾好了，可以开开心心地发博文啦！

个人博客这种东西，主要是为了记录一下自己成长的过程，其次也可以作为与其他人交流共享一些经验的平台，而对于我这种健忘的人则是个必不可少的东西，不然过些时日，连jekyll怎么拼的都会忘掉了Orz。。

之前也尝试在CSDN上维护自己的博客，但是感觉发文危险系数很高，审核慢就不说了，万一审核不过，码了半天的字都白费了，很是难受，听说Github可以免费挂个人主页，果断尝试一波。

建站选用的是jekyll这个工具，可以与Github配合使用，其他的还有Hexo等建站工具。

## jekyll简介

jekyll是一个可以将纯文本转化为静态网站的工具，因可以与github pages完美契合而受到很多程序猿的青睐。

[Bootstrap中文网](http://www.bootcss.com/)对jekyll的描述如下：
  
> 简单：无需数据库、评论功能，不需要不断地更新版本——只用关心你的博客内容  
> 静态：只用Markdown（或Textile）、Liquid、HTML&CSS就可以构建可部署的静态网站  
> 博客形态：自定义地址、分类、页面、博客内容以及自定义的布局设计都是系统中一等公民  

***

## jekyll手动建站

jekyll用的人很多，网上也有很多现成的模板供大家选用。起初我也想选个模板直接进入写博客的正题，但是找了很久都找不到心仪的模板，有的功能非常赞，但是页面风格不是我的style，有的风格很赞，但是功能又过于繁复。索性自己摸索做一个属于自己的，顺便学习一下这个工具的使用，毕竟用jekyll＋Github不发挥点geek精神有点不合适吧。

Anyway，如果只想火速建个站，可以直接跳转到[应用**jekyll模板**](#jekyll-template)。

### 环境搭建

jekyll的环境搭建非常简单，使用如下命令即可建立一个新的站点：

```
~ $ gem install jekyll
~ $ jekyll new myblog
~ $ cd myblog
~/myblog $ jekyll serve
```

完成上述命令之后，用浏览器访问`http://localhost:4000`即可打开这个新的站点（当然现在什么都没有）。

*PS：* 环境搭建中遇到的问题可以参考[jekyll快速指南](http://jekyll.bootcss.com/docs/quickstart/)尝试获取解决方案。

### 目录结构

一般情况下jekyll的目录结构如下，其中`[*]`是必选项（如果你想只写一个index.html的话就不需要用jekyll啦- -），而为了获得较好的站点结构以便后续的维护，下面的这个目录结构是最基本的。

```
/myblog
    |-- _includes
          |-- head.html
          |-- nav.html
          |-- footer.html
    |-- _layouts [*]
          |-- default.html
          |-- page.html
          |-- post.html
    |-- _posts [*]
          |-- 2016-03-23-hello-world.md
    |-- imgs
    |-- css
          |-- main.css
    |-- fonts
    |-- js
    |-- _config.yml [*]
    |-- index.html [*]
```

* `_layouts`中存放的是页面的布局文件。
* `_includes`中存放的是一些文档的组成部分，一般可以被`_layouts`中的页面布局文件所引用，以减少代码的重复，通常可以用来布局一些html文件头、导航条以及页面脚注等。
* `_posts`中存放的是发布的博文。
* `imgs`中存放的是网站用到的所有图片资源。
* `css`, `fonts`, `js`中存放的分别是页面引用的所有样式表、字体文件以及脚本。
* `_config.yml`文件是整个站点的配置文件。
* `index.html`文件即为站点的主页。

大部分情况下，除了站点主页外，一个站点中还会含有`404.html`, `about.html`等页面，用于更加完善的个人主页以及更佳的访客体验，当然这些都不是必须的，只要你的博文写的够精彩，这些都不是重点～

### 常用语法

在介绍不同文件的配置之前，首先需要了解一下jekyll中常用的一些语法规则，这些在编写页面布局文件的时候极为有用，后续博文信息的自动化生成方面就全靠它了。

* jekyll中的**全局变量**主要有`site`, `page`, `paginator`, `content`，而前三者又更像是一个对象，其中包含着其他的变量，使用`.`运算符即可访问，例如使用`site.title`可以访问站点名字变量。
* jekyll中**语句**使用`{ %`和`% }`进行包裹，且每一个语句块都需要显示地闭合，例如`{ % if % } blablabla { % endif % }`即为一个条件语句块。
* jekyll中使用双重大括号包裹的变量表示**取值**运算，例如`{ { page.title } }`语句可以取得`page.title`的值。

### 文件配置

##### _config.yml － 站点配置文件

该文件中保存的主要是整个站点的配置，其中的每项配置都作为全局变量`site`的成员变量可以在任意站点文件中访问到。

一个常见的站点配置文件可能长得像下面这样：

```
# Site settings
title: AmBeta Blog
SEOTitle: 三土的博客 | AmBeta Blog
header-img: imgs/header-bg.png
header-thumb: imgs/my-thumb.png
email: cyandrewchen@gmail.com
description: ""
keyword: ""
url: "http://ambeta.github.io"  # your host, for absolute URL
baseurl: ""  

# Build settings
gems: [jekyll-paginate]
paginate: 5
exclude: ["less","node_modules","Gruntfile.js","package.json","README.md"]

# Markdown settings
markdown: kramdown
kramdown:
  input: GFM
```

##### layouts － 页面布局

该文件夹下存放的是所有的页面布局文件，页面布局文件是一系列的`.html`文件，如下是一个典型的页面布局文件：

```
<!DOCTYPE html>
<html lang="zh-CN">

{ % include head.html % }

<body>
    { % include navbar.html % }

    { { content } }

    { % include footer.html % }

</body>
</html>
```

* 使用`{ % include head.html % }`语句可以引入`_includes`文件夹中`head.html`的所有内容。
* 使用`{ { content } }`语句会将使用该模版的文件的内容填充到这里。

##### index.html － 站点主页

jekyll会将该文件识别为站点的主页，同时Github也将识别该文件作为当访问你的Github pages时会显示的页面。  
**注意**该文件的名称一定要为`index.html`。  
在文件头部使用如下配置语句可以指定页面所用的模板：

```
---
layout: default
---
```

##### posts － 博文

该文件夹下存放的是所有的博文。  
jekyll支持多种markdown引擎（有需求的话可以在`_config.yml`文件中自定义引擎选择）。  
jekyll要求每篇博文的名字都遵循如下的格式：  

```
Year-Month-Date-PostTitle
```

例如`2016-03-22-hello-world.md`, `2020-02-22-byebye-world.textile`都是合法的博文命名。  
博文头部定义的变量可以作为`page`变量的成员变量被访问到，常见的博文头部如下：  

```
title: Hello World
date: 2016-03-22
layout: post
```

### 更多功能

##### paginator － 分页

jekyll支持自动分页，在`_config.yml`文件中加上如下配置可开启分页功能，可以控制每页的最大显示条目数量。  
例如，在`index.html`文件中使用如下语句可以分页显示所有博文的摘要信息：

```
<!-- Post Content Preview -->
{ % for post in paginator.posts % }
<div class="post-preview">
	<a href="{ { post.url | prepend: site.baseurl } }">
		<h2 class="post-title">
			{ { post.title } }
		</h2>
		<div class="post-content-preview">
			{ { post.content | strip_html | truncate:100 } }
		</div>
	</a>
	<p class="post-meta">
		Posted on { { post.date | date: "%B %-d, %Y" } }
	</p>
</div>
<hr>
{ % endfor % }
```

更多关于分页的信息可参考[jekyll分页功能](http://jekyll.bootcss.com/docs/pagination/)。

***

## <a name="jekyll-template"></a>应用jekyll模板

当你物色到一个很喜欢的theme时，你就可以fork一下（如果人家愿意的话），然后稍作修改就可以开始你的博客之旅了。

主要需要注意修改的有以下几个方面：

1. `_config.yml`文件中的站点名称、地址及其他个人信息与站点配置。
2. 修改主要布局文件如`head.html`, `footer.html`, `index.html`中包含的个人信息。

***PS：*** 如果theme的作者有在Github上维护关于该theme的说明文档的话，那就按照作者的指引进行相应的配置就好啦～

上述的修改完成后就可以在`posts`文件夹中添加自己的博文了。

***

## 本地调试页面

当火速写完一篇 *Hello World* 博文之后迫不及待地就想看看 *World* 到底有没有听到你的呼唤。

使用命令行进入站点的根目录，输入以下命令：

```
jekyll serve
```

jekyll便随即开始编译生成站点文件（存放在`_site`目录中），如果一切正常的话，jekyll会告诉你本地服务器部署的IP及端口号，打开浏览器进行访问即可。

在命令行中添加`--watch`选项可以让jekyll随时监听文件的变化并生成更新后的文件。

***

## 发布到Github

使用Git工具将站点同步到Github仓库上，一切就大功告成啦～！

```
~ $ git branch    // * master
~ $ git commit -a -m "commit comment"
~ $ git push origin master
```

如果问题卡在使用Github Pages建立个人主页方面，可以参考[用Github来部署静态网页](https://segmentfault.com/a/1190000002765287)，这篇文章写得很详细，当然，[Github官网](https://help.github.com/categories/github-pages-basics/)也有相关的用户指引。

***
