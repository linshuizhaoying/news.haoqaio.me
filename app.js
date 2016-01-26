var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var routes = require('./routes/index');
var getAlldata = require('./getAlldata');

var app = express();

var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0,1,2,3,4,5,6,7];
rule.hour = [0,4,8,12,16,20,23];
rule.minute = 53;

var linshui = schedule.scheduleJob(rule, function(){
  getAlldata();
  console.log("任务正在执行中..." + "hour" + rule.hour);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', routes);
app.use('/online', routes);
app.get('/getAlldata', routes);
app.get('/todayreaded', routes);
app.get('/clear', routes);
app.post('/liked', routes);
app.post('/getdata',routes);
app.post('/addsite',routes);
app.post('/updatesite',routes);
app.post('/testing',routes);
app.get('/showall/:type',routes);
app.get('/removeItem/:url',routes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
