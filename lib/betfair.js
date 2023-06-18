const axios = require("axios");
require("dotenv").config();
const { odds } = require('./../models/odds');
const { match } = require('./../models/match');
const { bet } = require('./../models/bet');
const { balance } = require('../models/balance');
const { wss } = require('./socket')
const { genBtToken } = require('../lib/token');
const math = require('mathjs');
const WebSocket = require('ws');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});

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

const getBtOdds = async(monitid, sportname, sportid, leagueid, markets, inPlayOnly, token, tm, gstakemode) => {
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

  console.log('=======================>retcatalogue', retcatalogue)

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

    var awayodd = marketbook[x].runners[0].ex;
    if (awayodd != undefined &&  awayodd.availableToBack.length != 0) {
      moneyline.away = awayodd.availableToBack[0].price;
    } else {
      moneyline.away = '-';
    }

    var homeodd = marketbook[x].runners[1].ex;
    if (homeodd != undefined && homeodd.availableToBack.length != 0) {
      moneyline.home = homeodd.availableToBack[0].price;
    } else {
      moneyline.home = '-';
    }

    moneyline.awayid = marketbook[x].runners[0].selectionId;
    moneyline.homeid = marketbook[x].runners[1].selectionId;
    moneyline.marketid = marketbook[x].marketId;

    marketdata.moneyline = moneyline;
    marketdata.handicap = {};
    marketdata.totals = {};

    if (moneyline.away != '-' || moneyline.home != '-')
      funcs.push(saveData(monitid, sportid, sportname, leagueid, competitionName[marketbook[x].marketId], events[marketbook[x].marketId], playname[marketbook[x].marketId].away, playname[marketbook[x].marketId].home, gamedate[marketbook[x].marketId], marketdata, tm, token, gstakemode));
  }


  if (funcs.length != 0)
    var ret = await Promise.all(funcs);
  
 
  var timestamp6 = new Date();
  console.log('betfair Time intaval =============>', timestamp6 - timestamp1);
}

const saveData = async(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, update, token, gstakemode) => {

  var odddata = {};
  if (market.moneyline != undefined)
  {
    odddata.away = market.moneyline.away
    odddata.home = market.moneyline.home
    odddata.awayid = market.moneyline.awayid;
    odddata.homeid = market.moneyline.homeid;
    odddata.marketid = market.moneyline.marketid;
  } else {
    odddata.away = '-'
    odddata.home = '-'
    odddata.awayid = '-'
    odddata.homeid = '-'
    odddata.marketid = '-'
  }

  var lstakemode = {};

  lstakemode.edge = gstakemode.edge;
  lstakemode.max = gstakemode.max;
  lstakemode.formula = 'f = (p * (d - 1) - q) / (d - 1)';
  lstakemode.kellybalance = gstakemode.kellybalance;
  lstakemode.awayamount = 0;
  lstakemode.homeamount = 0;
  lstakemode.state = false;

  var gameregex = gamedate.slice(0, 10);

  var [btodd, psodd, matchdata, gbalance] = await Promise.all([
    odds.findOne({site: 'betfair', monitId: monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0}),
    odds.findOne({site: 'ps3838', monitId: monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0, update: update}),
    match.findOne({monitId:monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0}),
    balance.find({})
  ]);

  if (matchdata == null) {
    if (psodd == null) {
      lstakemode.awayamount = 0;
      lstakemode.homeamount = 0;
    } else {
      var psdata = psodd.market[psodd.market.length - 1]
      if (odddata.away == '-' || psdata.moneyline.away == '-')
        lstakemode.awayamount = 0;
      else {
        var p = 1 / (psdata.moneyline.away * (1 + gstakemode.edge / 100))
        var q = 1 - p;
        var d = odddata.away;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.awayamount = (gstakemode.kellybalance * probability).toFixed(3);
      }
  
      if (odddata.home == '-' || psdata.moneyline.home == '-')
        lstakemode.homeamount = 0;
      else {
        var p = 1 / (psdata.moneyline.home * (1 + gstakemode.edge / 100))
        var q = 1 - p;
        var d = odddata.home;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.homeamount = (gstakemode.kellybalance * probability).toFixed(3);
      }
    }
  } else {
    if (matchdata.stakemode.state) {
      lstakemode.edge = matchdata.stakemode.edge;
      lstakemode.max = matchdata.stakemode.max;
      lstakemode.kellybalance = matchdata.stakemode.kellybalance;
      lstakemode.formula = matchdata.stakemode.formula;
      lstakemode.state = matchdata.stakemode.state;
    }

    if (psodd == null) {
      lstakemode.awayamount = matchdata.stakemode.awayamount;
      lstakemode.homeamount = matchdata.stakemode.homeamount;
    } else {
      var psdata = psodd.market[psodd.market.length - 1]
      if (odddata.away == '-' || psdata.moneyline.away == '-')
        lstakemode.awayamount = matchdata.stakemode.awayamount;
      else {
        var p = 1 / (psdata.moneyline.away * (1 + lstakemode.edge / 100))
        var q = 1 - p;
        var d = odddata.away;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.awayamount = (lstakemode.kellybalance * probability).toFixed(3);
      }
  
      if (odddata.home == '-' || psdata.moneyline.home == '-')
        lstakemode.homeamount = matchdata.stakemode.homeamount;
      else {
        var p = 1 / (psdata.moneyline.home * (1 + lstakemode.edge / 100))
        var q = 1 - p;
        var d = odddata.home;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.homeamount = (lstakemode.kellybalance * probability).toFixed(3);
      }
    }
  }
  
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
    matchdata.update = update;
    matchdata.betfairodd = odddata;
    matchdata.sportName = sportname;
    matchdata.eventId = eventid;
    matchdata.competitionName = leaugename;
    matchdata.stakemode = lstakemode;
    if (matchdata.betid != '0') {
      var options = {
        headers: {
          'X-Application': 'XCy3BR7EjehV32o3',
          'Accept':'application/json'
        }
      };
      options.headers['Content-type'] = "application/json";
      options.headers['X-Authentication'] = token;
      
      data = {
          "betStatus":"SETTLED",
          "betIds":[matchdata.betid]
      }

      var [betdata, ret] = await Promise.all([
        bet.find({betid: matchdata.betid}),
        axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listClearedOrders/', data, options)
      ]) 
      
      if (ret.data.clearedOrders[0] != undefined) {
        if (ret.data.clearedOrders[0].betOutcome == 'WON') {
          gbalance[0].available = gbalance[0].available + ret.data.clearedOrders[0].profit + ret.data.clearedOrders[0].profit;
          if (gbalance[0].available >= gbalance[0].max)
            gbalance[0].available = gbalance[0].max;
          betdata[0].state = 2;
        }
        else if (ret.data.clearedOrders[0].betOutcome == 'LOST')
          betdata[0].state = 1;

          var content = `Bet on ${away} vs ${home} in ${sportname}.\n(gamedate: ${gamedate} - ${ret.data.clearedOrders[0].betOutcome})`;

					const embed = new EmbedBuilder()
					.setTitle('Betfair')
					.setColor(0xff0000);

          var senddata = {
            type: 'betalarm',
            data: content
            }
          
          // Broadcast the match data to all connected clients
          wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(senddata));
            }
          });

        await Promise.all([
          gbalance[0].save(),
          betdata[0].save(),
          await webhookClient.send({
						content: content,
						username: 'Betfair',
						avatarURL: 'https://i.imgur.com/oBPXx0D.png'
						// embeds: [embed],
					})
        ])
      }
    }
  }

  if (btodd == null) {
    btodd = new odds({
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
    var oldaway = btodd.market[btodd.market.length - 1].moneyline.away != undefined ? btodd.market[btodd.market.length - 1].moneyline.away: '-';
    var oldhome = btodd.market[btodd.market.length - 1].moneyline.home != undefined ? btodd.market[btodd.market.length - 1].moneyline.home: '-';
    if ((oldaway != odddata.away) || (oldhome != odddata.home))
      btodd.market.push(market);
    btodd.update = update;
  }
  var [ret1, ret2] = await Promise.all([
    btodd.save(),
    matchdata.save(),
  ]);
}

module.exports.getBtOdds = getBtOdds;
