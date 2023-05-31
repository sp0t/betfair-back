require("dotenv").config();
const sse = require('server-sent-events');
const { odds } = require('./models/odds');
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

  const emitSSE= (res, id, data) =>{
    res.write('id: ' + id + '\n');
    res.write("data: " + data + '\n\n');
  }
  
  const handleSSE = async(req, res) =>{
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const sportid = req.query.sport;
    const leagueid = req.query.league;

    let result;
    if (sportid == 0)
      result = await odds.find({site:'betfair'}).sort({sportName: 1, competitionName: 1});
    else if (leagueid == 0)
      result = await odds.find({site:'betfair', sportId:sportid}).sort({competitionName: 1});
    else
      result = await odds.find({site:'betfair', sportId:sportid, competitionId: leagueid}).sort({competitionName: 1});

    const id = (new Date()).toLocaleTimeString();
    const data = JSON.stringify(result[0])
    // Sends a SSE every 3 seconds on a single connection.
    setInterval(async() => {
      emitSSE(res, id, data);
    }, 3000);
  
    emitSSE(res, id, data);
  }
  
  
  
  //use it
  
  app.get("/getLeagueData", handleSSE)

  require("./routes/monitor.router.js")(app);
  require("./routes/stakemode.router.js")(app);
  require("./routes/odds.router.js")(app);
  
  app.use('/', (req, res) => {
    res.send('API is working')
  });
  
  console.log('--  Server Started  --')
  // updatePs3838Odds();
  // updateBetfairOdds();
  // runsetBetState();
  // runplacebet();

const { v4: uuidv4 } = require('uuid');

// Generate a unique ID
const id = uuidv4();

console.log(id);
  
  const port = process.env.PORT || 4200;
  //Starting a server
  app.listen(port, () => {
    console.log(`app is running at ${port}`);
  });
});



