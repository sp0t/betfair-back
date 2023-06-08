require("dotenv").config();
var mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('strictQuery', false);
var mongoDB = mongoose.connection;

const { updateodds } = require('./cron/updateodd');
const { runsetBetState } = require('./cron/setbetstate');
const { runplacebet } = require('./cron/placebet');

mongoDB.once('open', function() {
  console.log('--  MogoDB Connected  --');
  var express = require('express');
  var app = express();
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
  });

  app.use(bodyParser.json());
  
  require("./routes/monitor.router.js")(app);
  require("./routes/stakemode.router.js")(app);
  require("./routes/odds.router.js")(app);
  require("./routes/match.router.js")(app);
  require("./routes/balance.router.js")(app);
  require("./routes/formula.router.js")(app);
  
  app.use('/', (req, res) => {
    res.send('API is working')
  });
  
  console.log('--  Server Started  --')
  updateodds();
  // runsetBetState();
  // runplacebet();

  const port = process.env.PORT || 4200;
  //Starting a server
  app.listen(port, () => {
    console.log(`app is running at ${port}`);
  });
});



