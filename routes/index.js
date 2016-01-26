var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var superagent = require('superagent');
var jsmin = require('jsmin2')

var Sites = require('../data/site');
var Recent = require('../data/recent');
var Liked = require('../data/liked');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '每日资讯' });

});
router.get('/admin', function(req, res, next) {

  res.render('admin', { title: '每日资讯' });

});
router.get('/online', function(req, res, next) {
  res.render('online', { title: '每日资讯' });

});

router.get('/clear', function(req, res, next) {
	  var query = Recent.find().remove({}); //清理昨日的内容。
	  query.exec();
	  res.send("清理成功!");
    res.end();

});
router.get('/todayreaded', function(req, res, next) {
	Recent.find({}, function (err, item) {
		for (var i = 0; i < item.length; i++) {
			addReaded(item[i].url);
		};
	});
	function addReaded(url){
		Recent.findOne({ url: url }, function(err, content) {
			if(content == null){
				res.end("error");
	    }else{
				content.readed = !content.readed;//取反，方便可以点赞或者取消点赞
				content.save(function(err) {
					if (err) {
						console.log('阅读失败');
					}
						console.log('阅读成功');
					  res.send("ok");
				    res.end();
					});
	    }
		});
	}
});
router.post('/liked', function(req, res, next) {
  var url = req.body.url;
	//更新数据
	Recent.findOne({ url: url }, function(err, content) {
		if(content == null){
			res.end("error");
    }else{
			content.liked = !content.liked;//取反，方便可以点赞或者取消点赞
			if(content.liked == false){
				removeLiked(content);
			}else{
				addLiked(content);
			}
			content.save(function(err) {
				if (err) {
					console.log('操作失败');
				}
					console.log('操作成功');
				  res.send("ok");
			    res.end();
				});
    }
	});
	function addLiked(item){
		Liked.findOne({ url: item.url }, function(err, content) {
			if(content != null){
				console.log("数据已存在，不将存入!");
	    }else{
				var newliked = new Liked(Liked);
				newliked.title = item.title;
				newliked.create_time = new Date();
				newliked.url = item.url;
				newliked.site = item.site;
				newliked.type = item.type;
				newliked.save(function(err) {
					if (err) {
						console.log('Liked保存失败');
					}else{
						console.log('Liked保存成功');
					}
				});
	    }
		});
	}
	function removeLiked(item){
	  var query = Liked.find().remove({ url: item.url });
	  query.exec();
	  console.log("Liked删除成功!");
	}

});
router.get('/getAlldata', function(req, res) {
	// var url = req.body.url;

	function enumItem(item){
		//clearYesterday();
		for (var i = 0; i < item.length; i++) {
			console.log("正在抓取:"+item[i].name);
			excuteCode(item[i].url,item[i].code,item[i].type);
		};
		console.log("抓取完毕!");
	}

	Sites.find({}, function (err, item) {
	  enumItem(item);
	});


	function insertItem(site,type){
			//插入数据库
		Recent.findOne({ url: site.link }, function(err, content) {
			if(content != null){
				console.log("数据已存在，不将存入!");
	    }else{
				var newsite = new Recent(Recent);
				newsite.type = type;
				newsite.liked = false;
				newsite.readed = false;
				newsite.url = site.link;
				newsite.title = site.title;
				newsite.create_time = new Date();
				newsite.save(function(err) {
					if (err) {
						console.log('保存失败');
					}
					  
					});
	    }
		});
	}	

	function excuteCode(url,code,type){
		superagent.get(url)
	  .end(function (err,response) {
	  	if (err) {
	     return next(err);
	    }
		  var $ = cheerio.load(response.text); //获取文本
		 // console.log(cheerio.load(res.text));
      var data_result = new Array();
		 	eval(code);
		 	if(data_result.length > 0){
		 		for (var i = 0; i < data_result.length; i++) {
		 			insertItem(data_result[i],type);
		 		};
		 	}else{
		 		console.log("抓取出错,网络可能有问题。");
		 	}
	  });

	}

	function clearYesterday(){
	  var query = Recent.find().remove({}); //清理昨日的内容。
	  query.exec();
	}

})


router.post('/getdata', function(req, res) {
	//从数据库里取出并输出数据
	
	Recent.find({}, function (err, item) {
	 // console.log(item);
	  res.send(JSON.stringify(item));
    res.end();
	});
})

router.post('/addsite', function(req, res,next) {
	var temp = req.body;
	//console.log(temp.name);
	var site = new Object();
	site.name = temp.name;
	site.type = temp.type;
	site.url = temp.url;
	site.code = temp.code;
	site.create_time = temp.create_time;

	//插入数据库
	Sites.findOne({ url: site.url }, function(err, content) {
		if(content != null){
			res.end("error");
    }else{
			var newsite = new Sites(Sites);
			newsite.name = site.name;
			newsite.type = site.type;
			newsite.url = site.url;
			newsite.code = site.code;
			newsite.create_time = site.create_time;
			newsite.save(function(err) {
				if (err) {
					console.log('保存失败');
				}
				  console.log('数据保存成功');
				  res.write("done");
					res.end();
				});
    }
	});
});

router.post('/updatesite', function(req, res,next) {
	var temp = req.body;
	//console.log(temp.name);
	var site = new Object();
	site.name = temp.name;
	site.type = temp.type;
	site.url = temp.url;
	site.code = temp.code;
	site.create_time = temp.create_time;

	//更新数据
	Sites.findOne({ url: site.url }, function(err, content) {
		if(content == null){
			res.end("error");
    }else{
			content.name = site.name;
			content.type = site.type;
			content.url = site.url;
			content.code = site.code;
			content.save(function(err) {
				if (err) {
					console.log('保存失败');
				}
				  console.log('数据保存成功');
				  res.write("done");
					res.end();
				});
    }
	});
});

//获取项目
router.get('/removeItem/:url', function(req, res, next) {

	  var url = req.params.url;
	 // console.log(url);
	  var query = Sites.find().remove({ url: url });
	  query.exec();
    res.send("done");
    res.end();
});

//获取列表
router.get('/showall/:type', function(req, res, next) {

	  var type = req.params.type;
	  if(type != "liked"){
	    Sites.find({type: type
			}, function(err,contents) {
				if (err) {
					console.log(err)
					return
				}
	      res.send(contents);
	      res.end();
			
			});
		}else{
			//获取所有Liked列表
			Liked.find({}, function (err, item) {
			  console.log("the liked"+item);
			  res.send(JSON.stringify(item));
		    res.end();
			});

		}
});

//测试平台
router.post('/testing', function(req, res,next) {
	var temp = req.body;
	var url = temp.url;
  var cacheCode = jsmin(temp.code).code; //通过压缩代码片段使其能在eval中执行
  console.log(cacheCode);
	var data_result = new Array();

	superagent.get(url)
	.end(function (err,response) {
		  if (err) {
			res.send(err);//输出结果
	    res.end();
	 //  return next(err);
	  }
	  console.log("this is responese:" + response);
	  if(response.text.length < 0){
		   res.send("抓取失败，请重试!");//输出结果
		   res.end();
	  }else{
			var $ = cheerio.load(response.text);
	//		console.log(cacheCode);
		 	function getcache(){
		 	 eval(cacheCode); //执行代码插件
		   res.send(cacheCode + JSON.stringify(data_result));//输出结果
		   res.end();
		 	}
		  
		  getcache();//执行并输出结果
	  }


	});
});
module.exports = router;
