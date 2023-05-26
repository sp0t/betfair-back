require("dotenv").config();
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('strictQuery', false);
var mongoDB = mongoose.connection;

const { updatePs3838Odds } = require('./cron/ps3838');
const { updateBetfairOdds } = require('./cron/betfair');
const { runsetBetState } = require('./cron/setbetstate');
const { runplacebet } = require('./cron/placebet');

mongoDB.once('open', function() {
  console.log('--  MogoDB Connected  --');
  var express = require('express');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');
  
  var app = express();
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
  });
  
  app.use(logger('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  require("./routes/monitor.router.js")(app);
  require("./routes/stakemode.router.js")(app);
  
  app.use('/', (req, res) => {
    res.send('API is working')
  });
  
  
  console.log('--  Server Started  --')
  // updatePs3838Odds();
  // updateBetfairOdds();
  // runsetBetState();
  // runplacebet();

  
  const port = process.env.PORT || 4200;
  //Starting a server
  app.listen(port, () => {
    console.log(`app is running at ${port}`);
  });
});



