const axios = require("axios");

const { odds } = require('./../models/odds');

const getBtOdds = async(sportId, leagueids, markets, inPlayOnly, username, password, tm) => {

  console.log(sportId, leagueids)

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

  //getting market catalogue[sportId]
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

  var catalogue = {};
  var tmpcatalogue = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/', data, options);
  catalogue[sportId] = tmpcatalogue.data;

  var moneyline ={};
  var handicap ={};
  var totals ={};
  var playname = {};
  var competitionId = {};
  var competitionName = {};
  var events = [];
  var eventName = {};
  var sportName = {};
  var matchday = {};
  var marketids = [];
  var marketeventid = {};
  
  for (x in catalogue[sportId]) {
    if (catalogue[sportId][x].hasOwnProperty('marketName')) {
      if (markets.includes(catalogue[sportId][x].marketName)) {
        if (catalogue[sportId][x].marketName == 'Moneyline') {
          if (!events.includes(catalogue[sportId][x].event.id)) events.push(catalogue[sportId][x].event.id)
          if (playname[catalogue[sportId][x].event.id] == undefined) playname[catalogue[sportId][x].event.id] = {}
          competitionId[catalogue[sportId][x].event.id] = catalogue[sportId][x].competition.id;
          competitionName[catalogue[sportId][x].event.id] = catalogue[sportId][x].competition.name;
          marketeventid[catalogue[sportId][x].marketId] = catalogue[sportId][x].event.id;
          eventName[catalogue[sportId][x].event.id] = catalogue[sportId][x].event.name;
          sportName[catalogue[sportId][x].event.id] = catalogue[sportId][x].eventType.name;
          matchday[catalogue[sportId][x].event.id] = catalogue[sportId][x].marketStartTime;

          playname[catalogue[sportId][x].event.id].away = catalogue[sportId][x].runners[0].runnerName;
          playname[catalogue[sportId][x].event.id].home = catalogue[sportId][x].runners[1].runnerName;
          catalogue[sportId][x]['awayid'] = catalogue[sportId][x].runners[0].selectionId;
          catalogue[sportId][x]['homeid'] = catalogue[sportId][x].runners[1].selectionId;

          marketids.push(catalogue[sportId][x].marketId);
        }
        
        handicap[catalogue[sportId][x].event.id] = {};
        totals[catalogue[sportId][x].event.id] = {};
  
        // if (catalogue[sportId][x].marketName == 'Handicap') {
        //   handicap[catalogue[sportId][x].event.id] = {};
        //   if (marketbook[sportId].runners) {
        //     for (var y in marketbook[sportId].runners) {
        //       if ((marketbook[sportId][y].runners[z].ex.availableToBack.length != 0) || (marketbook[sportId][y].runners[z].ex.availableToLay.length != 0)) {
        //         if (handicap[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap] == undefined) handicap[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap] = {}
        //         if (marketbook[sportId][y].runners[z].selectionId == catalogue[sportId][x].awayid) {
        //           handicap[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].away = marketbook[sportId][y].runners[z].ex 
        //           handicap[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].awayid = marketbook[sportId][y].runners[z].selectionId 
        //         }
        //         if (marketbook[sportId][y].runners[z].selectionId == catalogue[sportId][x].homeid) {
        //           handicap[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].home = marketbook[sportId][y].runners[z].ex;
        //           handicap[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].homeid = marketbook[sportId][y].runners[z].selectionId;
        //         }
        //         handicap[catalogue[sportId][x].event.id].marketid = marketbook[sportId].marketId
        //       }
        //     }
        //   }
        // }
  
        // if (catalogue[sportId][x].marketName == 'Total Points') {
        //   totals[catalogue[sportId][x].event.id] = {};
        //   if (marketbook[sportId].runners) {
        //     for (var y in marketbook[sportId].runners) {
        //       if ((marketbook[sportId][y].runners[z].ex.availableToBack.length != 0) || (marketbook[sportId][y].runners[z].ex.availableToLay.length != 0)) {
        //         if (totals[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap] == undefined) totals[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap] = {}
        //         if (marketbook[sportId][y].runners[z].selectionId == catalogue[sportId][x].awayid) {
        //           totals[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].under = marketbook[sportId][y].runners[z].ex;
        //           totals[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].underid = marketbook[sportId][y].runners[z].selectionId;
        //         } 
        //         if (marketbook[sportId][y].runners[z].selectionId == catalogue[sportId][x].homeid) {
        //           totals[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].over = marketbook[sportId][y].runners[z].ex;
        //           totals[catalogue[sportId][x].event.id][marketbook[sportId][y].runners[z].handicap].overid = marketbook[sportId][y].runners[z].selectionId;
        //         } 
        //         totals[catalogue[sportId][x].event.id].marketid = marketbook[sportId].marketId
        //       }
        //     }
        //   }
        // }
      }
    }
  }

  data = {
    "marketIds": marketids,
    "priceProjection": {
        "priceData": ["EX_BEST_OFFERS", "EX_TRADED"]
    } 
  }


  var marketbook = {};
  var tmpmarketbook = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
  marketbook[sportId] = tmpmarketbook.data[0];

  for (var y in marketbook[sportId]) {
    for (var z in marketbook[sportId][y].runners) {
      if ((marketbook[sportId][y].runners[z].ex.availableToBack.length != 0) || (marketbook[sportId][y].runners[z].ex.availableToLay.length != 0)) {
        if (marketbook[sportId][y].runners[z].selectionId == catalogue[sportId][x].awayid)  {
          moneyline[marketeventid[marketbook[sportId][y].marketId]].away = marketbook[sportId][y].runners[z].ex;
          moneyline[marketeventid[marketbook[sportId][y].marketId]].awayid = marketbook[sportId][y].runners[z].selectionId;
        }
        if (marketbook[sportId][y].runners[z].selectionId == catalogue[sportId][x].homeid)  {
          moneyline[marketeventid[marketbook[sportId][y].marketId]].home = marketbook[sportId][y].runners[z].ex;
          moneyline[marketeventid[marketbook[sportId][y].marketId]].homeid = marketbook[sportId][y].runners[z].selectionId
        }
        if (marketbook[sportId][y].runners[z].runnerName == 'draw') {
          moneyline[marketeventid[marketbook[sportId][y].marketId]].draw = marketbook[sportId][y].runners[z].ex;
          moneyline[marketeventid[marketbook[sportId][y].marketId]].drawid = marketbook[sportId][y].runners[z].selectionId;
        }
        moneyline[marketeventid[marketbook[sportId][y].marketId]].marketid = marketbook[sportId].marketId
      }
    }
  }

  for (x in events) {
    var marketdata = { updatedAt: tm }
    if (moneyline[events[x]] != undefined)
      marketdata.moneyline = moneyline[events[x]];
    if (handicap[events[x]] != undefined)
      marketdata.handicap = handicap[events[x]];
    if (totals[events[x]] != undefined)
      marketdata.totals = totals[events[x]];

    var stakemode = {};
    stakemode.diffmode = 0;
    stakemode.betmode = 0;
    stakemode.fixfrom = 0;
    stakemode.fixto = 0;
    stakemode.percentfrom = 0;
    stakemode.percentto = 0;
    stakemode.fixed = 0;
    stakemode.percent = 0;
    stakemode.max = 0;
    stakemode.state = false;

    var tmp = await odds.findOne({site: 'betfair', sportId: sportId, eventId: events[x]});
    if (tmp == null) {
      tmp = new odds({
        site: 'betfair',
        sportId: sportId,
        sportName: sportName[events[x]],
        competitionId: competitionId[events[x]],
        competitionName: competitionName[events[x]],
        eventId: events[x],
        eventName: eventName[events[x]],
        home: playname[events[x]].home,
        away: playname[events[x]].away,
        update: marketdata.updatedAt,
        matchday: matchday[events[x]],
        stakemode: stakemode,
        market: [marketdata]
      })
    }
    else {
      tmp.market.push(marketdata);
      tmp.update = marketdata.updatedAt;
    }
    await tmp.save()
  }
}
module.exports.getBtOdds = getBtOdds;