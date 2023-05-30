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
  
  for (x in catalogue[sportId]) {
    if (catalogue[sportId][x].hasOwnProperty('marketName')) {
      if (markets.includes(catalogue[sportId][x].marketName)) {
        console.log('======================1',catalogue[sportId][x].event.id, catalogue[sportId][x].marketId, catalogue[sportId][x].marketName)
        if (catalogue[sportId][x].marketName == 'Moneyline') {
          console.log('======================2',catalogue[sportId][x].event.id, catalogue[sportId][x].marketId, catalogue[sportId][x].marketName)
          if (!events.includes(catalogue[sportId][x].event.id)) events.push(catalogue[sportId][x].event.id)
          if (playname[catalogue[sportId][x].event.id] == undefined) playname[catalogue[sportId][x].event.id] = {}
          competitionId[catalogue[sportId][x].event.id] = catalogue[sportId][x].competition.id;
          competitionName[catalogue[sportId][x].event.id] = catalogue[sportId][x].competition.name;
          eventName[catalogue[sportId][x].event.id] = catalogue[sportId][x].event.name;
          sportName[catalogue[sportId][x].event.id] = catalogue[sportId][x].eventType.name;
          matchday[catalogue[sportId][x].event.id] = catalogue[sportId][x].marketStartTime;

          playname[catalogue[sportId][x].event.id].away = catalogue[sportId][x].runners[0].runnerName;
          playname[catalogue[sportId][x].event.id].home = catalogue[sportId][x].runners[1].runnerName;
          catalogue[sportId][x]['awayid'] = catalogue[sportId][x].runners[0].selectionId;
          catalogue[sportId][x]['homeid'] = catalogue[sportId][x].runners[1].selectionId;

          data = {
            "marketIds": [catalogue[sportId][x].marketId],
            "priceProjection": {
                "priceData": ["EX_BEST_OFFERS", "EX_TRADED"]
            } 
          }
    

          var marketbook = {};
          var marketid = catalogue[sportId][x].marketId;
          var tmpmarketbook = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
          marketbook[marketid] = tmpmarketbook.data[0];

          console.log('======================3',catalogue[sportId][x].event.id, catalogue[sportId][x].marketId, catalogue[sportId][x].marketName)
            moneyline[catalogue[sportId][x].event.id] = {};
            if (marketbook[marketid].runners) {
              for (var y in marketbook[marketid].runners) {
                if ((marketbook[marketid].runners[y].ex.availableToBack.length != 0) || (marketbook[marketid].runners[y].ex.availableToLay.length != 0)) {
                  if (marketbook[marketid].runners[y].selectionId == catalogue[sportId][x].awayid)  {
                    moneyline[catalogue[sportId][x].event.id].away = marketbook[marketid].runners[y].ex;
                    moneyline[catalogue[sportId][x].event.id].awayid = marketbook[marketid].runners[y].selectionId;
                  }
                  if (marketbook[marketid].runners[y].selectionId == catalogue[sportId][x].homeid)  {
                    moneyline[catalogue[sportId][x].event.id].home = marketbook[marketid].runners[y].ex;
                    moneyline[catalogue[sportId][x].event.id].homeid = marketbook[marketid].runners[y].selectionId
                  }
                  if (marketbook[marketid].runners[y].runnerName == 'draw') {
                    moneyline[catalogue[sportId][x].event.id].draw = marketbook[marketid].runners[y].ex;
                    moneyline[catalogue[sportId][x].event.id].drawid = marketbook[marketid].runners[y].selectionId;
                  }
                  moneyline[catalogue[sportId][x].event.id].marketid = marketbook[marketid].marketId
                }
             }
            }
            handicap[catalogue[sportId][x].event.id] = {};
            totals[catalogue[sportId][x].event.id] = {};
        }
  
  
        // if (catalogue[sportId][x].marketName == 'Handicap') {
        //   handicap[catalogue[sportId][x].event.id] = {};
        //   if (marketbook[marketid].runners) {
        //     for (var y in marketbook[marketid].runners) {
        //       if ((marketbook[marketid].runners[y].ex.availableToBack.length != 0) || (marketbook[marketid].runners[y].ex.availableToLay.length != 0)) {
        //         if (handicap[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap] == undefined) handicap[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap] = {}
        //         if (marketbook[marketid].runners[y].selectionId == catalogue[sportId][x].awayid) {
        //           handicap[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].away = marketbook[marketid].runners[y].ex 
        //           handicap[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].awayid = marketbook[marketid].runners[y].selectionId 
        //         }
        //         if (marketbook[marketid].runners[y].selectionId == catalogue[sportId][x].homeid) {
        //           handicap[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].home = marketbook[marketid].runners[y].ex;
        //           handicap[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].homeid = marketbook[marketid].runners[y].selectionId;
        //         }
        //         handicap[catalogue[sportId][x].event.id].marketid = marketbook[marketid].marketId
        //       }
        //     }
        //   }
        // }
  
        // if (catalogue[sportId][x].marketName == 'Total Points') {
        //   totals[catalogue[sportId][x].event.id] = {};
        //   if (marketbook[marketid].runners) {
        //     for (var y in marketbook[marketid].runners) {
        //       if ((marketbook[marketid].runners[y].ex.availableToBack.length != 0) || (marketbook[marketid].runners[y].ex.availableToLay.length != 0)) {
        //         if (totals[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap] == undefined) totals[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap] = {}
        //         if (marketbook[marketid].runners[y].selectionId == catalogue[sportId][x].awayid) {
        //           totals[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].under = marketbook[marketid].runners[y].ex;
        //           totals[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].underid = marketbook[marketid].runners[y].selectionId;
        //         } 
        //         if (marketbook[marketid].runners[y].selectionId == catalogue[sportId][x].homeid) {
        //           totals[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].over = marketbook[marketid].runners[y].ex;
        //           totals[catalogue[sportId][x].event.id][marketbook[marketid].runners[y].handicap].overid = marketbook[marketid].runners[y].selectionId;
        //         } 
        //         totals[catalogue[sportId][x].event.id].marketid = marketbook[marketid].marketId
        //       }
        //     }
        //   }
        // }
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