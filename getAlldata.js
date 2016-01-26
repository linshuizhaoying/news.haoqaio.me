var cheerio = require('cheerio');
var superagent = require('superagent');
var jsmin = require('jsmin2')

var Sites = require('./data/site');
var Recent = require('./data/recent');
var Liked = require('./data/liked');
function getAlldata(){
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
					console.log("数据已在，不将存入!");
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
						}else{
						  console.log('保存成功');
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
		  console.log("清理成功！");
		}

}

module.exports = getAlldata;