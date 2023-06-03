const axios = require("axios");

const { odds } = require('./../models/odds');
const { match } = require('./../models/match');

const getBtOdds = async(monitid, sportname, sportId, leagueids, markets, inPlayOnly, username, password, tm) => {
  var options = {
    headers: {
      'X-Application': 'XCy3BR7EjehV32o3',
      'Accept':'application/json'
    }
  };

  //getting token
  options.headers['Content-type'] = "application/x-www-form-urlencoded";

  var params = {
      'username':username,
      'password':password,
  }

  var token = await axios.post("https://identitysso.betfair.com/api/login", params, options);
  token = token.data.token;

  options.headers['Content-type'] = "application/json";
  options.headers['X-Authentication'] = token;

  //getting market catalogue
  data = {
    "filter": {
      "eventTypeIds": [sportId],
      "competitionIds":leagueids
    },
    'marketProjection': ["COMPETITION", "EVENT", "EVENT_TYPE", "RUNNER_DESCRIPTION", "RUNNER_METADATA", "MARKET_START_TIME"],
    'maxResults': 1000
  }

  if (inPlayOnly) {
    data.filter.inPlayOnly = inPlayOnly;
  }

  var catalogue = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/', data, options);
  catalogue = catalogue.data;

  var playname = {};
  var competitionId = {};
  var competitionName = {};
  var events = {};
  var eventName = {};
  var matchday = {};
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
          eventName[catalogue[x].marketId] = catalogue[x].event.name;
          matchday[catalogue[x].marketId] = catalogue[x].marketStartTime;

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

            var ret = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
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

  var ret = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
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

    funcs.push(saveData(sportId, monitid, sportname, competitionId[marketbook[x].marketId], competitionName[marketbook[x].marketId], events[marketbook[x].marketId], eventName[marketbook[x].marketId], playname[marketbook[x].marketId].away, playname[marketbook[x].marketId].home, tm, matchday[marketbook[x].marketId], marketdata));
  }

  var ret = await Promise.all([funcs]);

}

const saveData = async(sportId, monitid, sportname, competitionId, competitionName, eventId, eventName, away, home, update, matchday, market) => {

  var stakemode = {};

  stakemode.diffmode = 0;
  stakemode.betmode = 0;
  stakemode.from = 0;
  stakemode.to = 0;
  stakemode.stake = 0;
  stakemode.max = 0;
  stakemode.state = false;

  var odddata = {};
  if (market.moneyline != undefined)
  {
    odddata.away = market.moneyline.away.availableToBack[0].price;
    odddata.home = market.moneyline.home.availableToBack[0].price;
    odddata.awayid = market.moneyline.awayid;
    odddata.homeid = market.moneyline.homeid;
    odddata.marketid = market.moneyline.marketid;
  }
  
  var [odd, matchdata] = await Promise.all([
    odds.findOne({site: 'betfair', sportId: sportId, eventId: eventId}),
    match.findOneAndUpdate({monitId:monitid, sportName: sportname, away: away, home: home, state: 0}, 
      {
        monitId:monitid,
        sportName: sportname,
        competitionName: competitionName,
        eventId: eventId,
        away: away,
        home: home,
        matchday: matchday,
        update: update,
        stakemode: stakemode,
        betfairodd: odddata,
      }, {upsert: true, new: true, setDefaultsOnInsert: true})
  ]); 

  if (odd == null) {
    odd = new odds({
      site: 'betfair',
      monitId: monitid,
      sportId: sportId,
      sportName: sportname,
      competitionId: competitionId,
      competitionName: competitionName,
      eventId: eventId,
      eventName: eventName,
      away: away,
      home: home,
      update: update,
      matchday: matchday,
      market: [market]
    })
  }
  else {
    odd.market.push(market);
    odd.update = update;
  }
  await odd.save()
}

module.exports.getBtOdds = getBtOdds;