const axios = require("axios");

const { odds } = require('./../models/odds');
const { match } = require('./../models/match');

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

const getBtOdds = async(monitid, sportname, sportid, leagueid, markets, inPlayOnly, username, password, tm) => {
  var options = {
    headers: {
      'X-Application': 'XCy3BR7EjehV32o3',
      'Accept':'application/json'
    }
  };


  console.log('befair===1,', monitid, sportid, leagueid);

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
      "eventTypeIds": [sportid],
      "competitionIds":[leagueid]
    },
    'marketProjection': ["COMPETITION", "EVENT", "EVENT_TYPE", "RUNNER_DESCRIPTION", "RUNNER_METADATA", "MARKET_START_TIME"],
    'maxResults': 1000
  }

  if (inPlayOnly) {
    data.filter.inPlayOnly = inPlayOnly;
  }

  var retcatalogue = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/', data, options);
  var catalogue = retcatalogue.data;

  var playname = {};
  var competitionId = {};
  var competitionName = {};
  var events = {};
  var gamedate = {};
  var marketbook = [];
  var marketids = [];

  console.log('befair===2,', monitid, sportid, leagueid);
  
  for (var x in catalogue) {
    if (catalogue[x].hasOwnProperty('marketName')) {
      if (markets.includes(catalogue[x].marketName)) {
        if (catalogue[x].marketName == 'Moneyline') {
          events[catalogue[x].marketId] = catalogue[x].event.id;
          playname[catalogue[x].marketId] = {}
          competitionId[catalogue[x].marketId] = catalogue[x].competition.id;
          competitionName[catalogue[x].marketId] = catalogue[x].competition.name;
          gamedate[catalogue[x].marketId] = catalogue[x].event.openDate;

          console.log(catalogue[x].marketId, catalogue[x].event.openDate)

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

    funcs.push(saveData(monitid, sportid, sportname, leagueid, competitionName[marketbook[x].marketId], events[marketbook[x].marketId], playname[marketbook[x].marketId].away, playname[marketbook[x].marketId].home, marketdata, gamedate[marketbook[x].marketId],  tm));
  }

  console.log('befai3===,', monitid, sportid, leagueid);

  if (funcs.length != 0)
    var ret = await Promise.all([funcs]);

}

const saveData = async(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, update) => {

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

  console.log(monitid, away, home, gamedate, update);
  
  var [odd, matchdata] = await Promise.all([
    odds.findOne({site: 'betfair', sportId: sportid, eventId: eventid}),
    match.findOneAndUpdate({monitId:monitid, away: away, home: home, gamedate: gamedate, state: 0}, 
      {
        monitId:monitid,
        sportName: sportname,
        competitionName: leaugename,
        eventId: eventid,
        away: away,
        home: home,
        gamedate: gamedate,
        update: update,
        stakemode: stakemode,
        betfairodd: odddata,
      }, {upsert: true, new: true, setDefaultsOnInsert: true})
  ]); 

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
  await odd.save()
}

module.exports.getBtOdds = getBtOdds;
