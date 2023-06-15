require("dotenv").config();
const WebSocket = require('ws');
const { odds } = require('./../models/odds');
const { match } = require('./../models/match');
const { bet } = require('./../models/bet');
const { stakemode } = require('../models/stakemode');
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT });
let sportName = 'ALL';
let competitionName = 'ALL';
let monitID = '';
let betID = '';
let awayName = '';
let homeName = '';

const startSocketServer = async() => {
    console.log('WebSocket started....');
    wss.on('connection', (ws) => {
        console.log('WebSocket connected');
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type == 'SportLeagueName') {
                sportName = parsedMessage.sportname;
                competitionName = parsedMessage.competitionname;
                console.log('SportLeagueName===============>', sportName, competitionName);
                sendMatchData();
            }

            if (parsedMessage.type == 'BetInformation') {
                monitID = parsedMessage.monitid;
                betID = parsedMessage.betid;
                awayName = parsedMessage.away;
                homeName = parsedMessage.home;
                console.log('BetInformation===============>', monitID, betID, awayName, homeName);
                sendOddData(monitID, awayName, homeName);
            }
        });

        // Event handler for WebSocket disconnection
        ws.on('close', () => {
        console.log('WebSocket disconnected');
        });
    });
}

const getSportLeagueName = () => {
    var ret = {
        sportname: sportName,
        competitionname: competitionName
    };

    return ret;
}

const getBetInformation = () => {
    var ret = {
        monitid: monitID,
        betid: betID,
        away: awayName,
        home: homeName
    };

    return ret;
}

const sendMatchData = async() => {
    // Access the WebSocket server instance
    var ret = getSportLeagueName();
    var sportName = ret.sportname;
    var competitionName = ret.competitionname;
    var sport = sportName + '-' + competitionName;
  
    var funcs = [];


    if (sportName == 'ALL')
      funcs.push(match.find({state: 0, competitionName:{$ne:''}}).sort({sportName: 1, competitionName:1}));
    else if (competitionName == 'ALL')
      funcs.push(match.find({sportName:  { $regex: sportName, $options: 'i' }, competitionName:{$ne:''}, state: 0}).sort({competitionName:1}));
    else
      funcs.push(match.find({sportName: sport, competitionName:competitionName,  state: 0}));

    funcs.push(stakemode.find({}));

    try {
      var [btret, gstakemode] = await Promise.all(funcs)
    } catch (error) {
      return;
    }

    var senddata = {
      type: 'SportLeagueName',
      data: btret,
      stakemode: gstakemode[0]
    }
  
    // Broadcast the match data to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(senddata));
      }
    });
  };
  
  const sendOddData = async() => {
    var ret = getBetInformation();
    console.log('sendOddData', ret.monitid, ret.away, ret.home)
  
      try{
          var [psodd, btodd] = await Promise.all([
              await odds.find({site:'ps3838', monitId:ret.monitid, away:ret.away, home:ret.home, state: 0}),
              await odds.find({site:'betfair', monitId:ret.monitid, away:ret.away, home:ret.home, state: 0})
              ])
          var result = {};
          result.betfair = btodd[0];
          result.ps3838 = psodd[0];
  
          if (ret.betid != '0' ) {
              var betdata = await bet.find({betid: ret.betid})
              result.betdata = betdata[0];
          }
          else
        result.betdata = [];
  
        var senddata = {
          type: 'BetInformation',
          data: result
        }

        console.log("================>result", result);
        // Broadcast the match data to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(senddata));
          }
        });
      } catch(e) {
        return;
      }
  
  };


module.exports.wss = wss;
module.exports.startSocketServer = startSocketServer;
module.exports.getSportLeagueName = getSportLeagueName;
module.exports.getBetInformation = getBetInformation;