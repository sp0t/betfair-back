const axios = require("axios");

const { odds } = require('./../models/odds');
const { match } = require('./../models/match');
const { balance } = require('../models/balance');
const { wss, getSportLeagueName, getBetInformation } = require('./socket')
const { genBtToken } = require('../lib/token');
const math = require('mathjs');
const WebSocket = require('ws');

const convertDate = (dateString) => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

const getBtOdds = async(monitid, sportname, sportid, leagueid, markets, inPlayOnly, token, tm) => {
  var timestamp1 = new Date();
  var options = {
    headers: {
      'X-Application': 'XCy3BR7EjehV32o3',
      'Accept':'application/json',
      'Content-type': "application/json",
      'X-Authentication': token
    }
  };

  //getting market catalogue
  data = {
    "filter": {
      "eventTypeIds": [sportid],
      "competitionIds":[leagueid]
    },
    'marketProjection': ["COMPETITION", "EVENT", "EVENT_TYPE", "RUNNER_DESCRIPTION", "RUNNER_METADATA", "MARKET_START_TIME"],
    'maxResults': 1000
  }

  if (inPlayOnly) {
    data.filter.inPlayOnly = inPlayOnly;
  }

  try {
    var retcatalogue = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/', data, options);
  } catch (error) {
    console.log('token====================>', token)
    await genBtToken();
    return;
  }

  var catalogue = retcatalogue.data;

  var playname = {};
  var competitionId = {};
  var competitionName = {};
  var events = {};
  var gamedate = {};
  var marketbook = [];
  var marketids = [];
  
  for (var x in catalogue) {
    if (catalogue[x].hasOwnProperty('marketName')) {
      if (markets.includes(catalogue[x].marketName)) {
        if (catalogue[x].marketName == 'Moneyline') {
          events[catalogue[x].marketId] = catalogue[x].event.id;
          playname[catalogue[x].marketId] = {}
          competitionId[catalogue[x].marketId] = catalogue[x].competition.id;
          competitionName[catalogue[x].marketId] = catalogue[x].competition.name;
          gamedate[catalogue[x].marketId] = convertDate(catalogue[x].event.openDate);

          playname[catalogue[x].marketId].away = catalogue[x].runners[0].runnerName;
          playname[catalogue[x].marketId].home = catalogue[x].runners[1].runnerName;

          marketids.push(catalogue[x].marketId)

          if ( marketids.length == 10) {
            data = {
              "marketIds": marketids,
              "priceProjection": {
                  "priceData": ["EX_BEST_OFFERS", "EX_TRADED"]
              } 
            }

            try {
              var ret = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
            } catch (error) {
              await genBtToken();
              return;
            }
            marketbook = marketbook.concat(ret.data)
            marketids = [];
          }
        }  
      }
    }
  }

  data = {
    "marketIds": marketids,
    "priceProjection": {
        "priceData": ["EX_BEST_OFFERS", "EX_TRADED"]
    } 
  }

  try {
    var ret = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
  } catch (error) {
    await genBtToken();
    return;
  }

  marketbook = marketbook.concat(ret.data);

  var funcs = [];

  for (var x in marketbook) {

    var marketdata = {update: tm};
    var moneyline = {};

    moneyline.away = marketbook[x].runners[0].ex;
    moneyline.awayid = marketbook[x].runners[0].selectionId;
    moneyline.home = marketbook[x].runners[1].ex;
    moneyline.homeid = marketbook[x].runners[1].selectionId;
    moneyline.marketid = marketbook[x].marketId;

    marketdata.moneyline = moneyline;
    marketdata.handicap = {};
    marketdata.totals = {};

    funcs.push(saveData(monitid, sportid, sportname, leagueid, competitionName[marketbook[x].marketId], events[marketbook[x].marketId], playname[marketbook[x].marketId].away, playname[marketbook[x].marketId].home, gamedate[marketbook[x].marketId], marketdata, tm));
  }


  if (funcs.length != 0)
    var ret = await Promise.all([funcs]);
  
  var timestamp6 = new Date();
  // console.log('Betfair Time intaval =======5======>', timestamp6 - timestamp1);

}

const saveData = async(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, update) => {

  var lstakemode = {};

  lstakemode.diffmode = 0;
  lstakemode.betmode = 0;
  lstakemode.from = 0;
  lstakemode.to = 0;
  lstakemode.stake = 0;
  lstakemode.max = 0;
  lstakemode.probability = 0;
  lstakemode.formula = 'f = (p * (d - 1) -q) / (d - 1)';
  lstakemode.kellybalance = 0;
  lstakemode.state = false;

  var odddata = {};
  if (market.moneyline != undefined && market.moneyline.away.availableToBack.length != 0)
  {
    odddata.away = market.moneyline.away.availableToBack[0].price;
    odddata.home = market.moneyline.home.availableToBack[0].price;
    odddata.awayid = market.moneyline.awayid;
    odddata.homeid = market.moneyline.homeid;
    odddata.marketid = market.moneyline.marketid;
  }
  var gameregex = gamedate.slice(0, 10);
  var [odd, matchdata, gstakemode] = await Promise.all([
    odds.findOne({site: 'betfair', sportId: sportid, eventId: eventid}),
    match.findOne({monitId:monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0}),
    balance.find({})
  ]); 

  if (matchdata == null) {
    matchdata = new match({
      monitId:monitid,
      sportName: sportname,
      competitionName: leaugename,
      eventId: eventid,
      away: away,
      home: home,
      gamedate: gamedate,
      update: update,
      stakemode: lstakemode,
      betfairodd: odddata
    })
  } else {
    var available;
    var kellybalance;
    if (matchdata.stakemode != undefined) {
      if (matchdata.stakemode.probability == 0) kellybalance = 0;
      else {
        if (matchdata.stakemode.max == 0)
          available = gstakemode[0].max;
        else
          available = matchdata.stakemode.max;
  
          var p = (matchdata.stakemode.probability) / 100;
          var q = 1 - p;
          var d;
          
          if (odddata.away <= odddata.home )
            d = odddata.away;
          else  
            d = odddata.home;

          // console.log('p=>', p, 'q=>', q, 'd=>', d, 'available=>', available);
          // Create a scope object with the variable values
          const scope = {
            p: p,
            d: d,
            q: q
          };
          
          // Evaluate the formula using math.evaluate()
          kellybalance = (math.evaluate(matchdata.stakemode.formula, scope));
          // console.log('kellybalance====================>', kellybalance)
      }
      matchdata.stakemode.kellybalance = kellybalance.toFixed(3) * available;
    } else {
      matchdata.stakemode = lstakemode;
    }

    matchdata.gamedate = gamedate;
    matchdata.update = update;
    matchdata.betfairodd = odddata;
    matchdata.sportName = sportname;
    matchdata.eventId = eventid;
    matchdata.competitionName = sportname;
  }

  if (odd == null) {
    odd = new odds({
      site: 'betfair',
      monitId: monitid,
      sportId: sportid,
      sportName: sportname,
      competitionId: leagueid,
      competitionName: leaugename,
      eventId: eventid,
      away: away,
      home: home,
      update: update,
      gamedate: gamedate,
      market: [market]
    })
  }
  else {
    var oldaway = odd.market[odd.market.length - 1].moneyline.away.availableToBack[0].price;
    var oldhome = odd.market[odd.market.length - 1].moneyline.home.availableToBack[0].price;
    if ((oldaway != odddata.away) || (oldhome != odddata.home))
      odd.market.push(market);
    odd.update = update;
  }

  var [ret1, ret2] = await Promise.all([
    odd.save(),
    matchdata.save(),
  ]);

  if ((oldaway != odddata.away) || (oldhome != odddata.home))
    sendOddData();

  sendMatchData();
}

const sendMatchData = async() => {
  // Access the WebSocket server instance
  var ret = getSportLeagueName();
  var sportName = ret.sportname;
  var competitionName = ret.competitionname;
  var sport = sportName + '-' + competitionName;
  console.log(sportName, sport)

  try{
	  var btret;
	  if (sportName == 'ALL')
		  btret = await match.find({state: 0, competitionName:{$ne:''}}).sort({sportName: 1, competitionName:1});
	  else if (competitionName == 'ALL')
		  btret = await match.find({sportName:  { $regex: sportName, $options: 'i' }, competitionName:{$ne:''}, state: 0}).sort({competitionName:1});
	  else
		  btret = await match.find({sportName: sport, competitionName:competitionName,  state: 0});
	} catch(e) {
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
      result.betdata = [];

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

module.exports.getBtOdds = getBtOdds;
module.exports.sendMatchData = sendMatchData;
module.exports.sendOddData = sendOddData;
