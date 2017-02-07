# 说明

该应用开发过程 [博客](http://haoqiao.me/2016/01/27/haoqiaozixun2.html)

## 技术栈

```

1.express
2.vue.js
3.webpack
4.爬虫核心用到了Node的模块:superagent cheerio

```

## 功能

```

1.定时抓取函数。利用爬虫抓取页面数据，保存到数据库

2.访问页面的时候先调用check函数。查看最近获取的数据并返回。
	自动更新，每天早上2点 6点 10点14点16点自动更新 20点

3.添加新的解析模块时自动执行爬虫爬取

4.数据库
		recent 用来保存最新爬的数据 包含 title name link created-time 
		like用来保存日常点赞的内容
		list 用来保存每个站的名称和地址，新增解析内容时候自动添加

```

### 支持爬虫代码的解析和插入

![imgn](http://haoqiao.qiniudn.com/hqzx1.png)

可以随时更新或者添加新的爬虫代码。如果目标网站结构变化了,只需要简单修改下爬虫插件里面的部分代码就能重新解析了。


# 效果图

![imgn](http://haoqiao.qiniudn.com/active77.gif)
