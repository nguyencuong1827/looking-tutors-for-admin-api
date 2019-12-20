var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
var passport = require('passport')
var dotenv = require('dotenv');

var indexRouter = require('./routes/index');
var managerRouter = require('./routes/manager');
var cors = require('cors');

var app = express();

require('./config-passport')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

dotenv.config();


//Kết nối cơ sở dữ liệu mongoose
var mongoose = require('mongoose');
mongoose.Promise = Promise;
const option = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,  
  useUnifiedTopology: true
};
const run = async () => {
  await mongoose.connect(process.env.DB_CONNECT, option);
}
run().catch(error => console.error(error));


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/manager', managerRouter);

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
