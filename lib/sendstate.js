const { odds } = require('./../models/odds');
const { match } = require('./../models/match');
const { wss, getSportLeagueName, getBetInformation } = require('./socket')
const { bet } = require('./../models/bet');
const WebSocket = require('ws');

const sendstate = async() => {
    await Promise.all([
        sendMatchData(),
        sendOddData()
    ])
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

    try {
      var [btret] = await Promise.all(funcs)
    } catch (error) {
      return;
    }
  
    var senddata = {
      type: 'SportLeagueName',
      data: btret
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
        result.betdata = {};
  
        var senddata = {
          type: 'BetInformation',
          data: result
        }
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

module.exports.sendstate = sendstate;