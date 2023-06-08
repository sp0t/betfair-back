require("dotenv").config();
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { updateodds } = require('./cron/updateodd');
const { runsetBetState } = require('./cron/setbetstate');
const { runplacebet } = require('./cron/placebet');
var express = require('express');
const sportName = 'ALL';
const competitionName = 'ALL';

mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('strictQuery', false);
var mongoDB = mongoose.connection;

mongoDB.once('open', function() {
  console.log('--  MogoDB Connected  --');
  const wsServer = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT })
  
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

  wsServer.on('connection', (ws) => {
    console.log('WebSocket connected');
    
    // Handle WebSocket events
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
    });
    
    ws.on('close', () => {
      console.log('WebSocket disconnected');
    });
  });  
  
  console.log('--  Server Started  --')
  updateodds();
  // runsetBetState();
  // runplacebet();

  const port = process.env.SERVER_PORT || 4200;
  //Starting a server
  app.listen(port, () => {
    console.log(`app is running at ${port}`);
  });
});

module.exports.wsServer = wsServer;
module.exports.sportName = sportName;
module.exports.competitionName = competitionName;


