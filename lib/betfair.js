const axios = require("axios");

const { odds } = require('./../models/odds');

const getBtOdds = async(sportId, leagueids, markets, inPlayOnly, username, password, sportname, monitid, tm) => {

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
        // if (catalogue[x].marketName == 'Moneyline') {
        //   moneyline[catalogue[x].event.id] = {};
        //   if (marketbook.runners) {
        //     for (var y in marketbook.runners) {
        //       if ((marketbook.runners[y].ex.availableToBack.length != 0) || (marketbook.runners[y].ex.availableToLay.length != 0)) {
        //         if (marketbook.runners[y].selectionId == catalogue[x].awayid)  {
        //           moneyline[catalogue[x].event.id].away = marketbook.runners[y].ex;
        //           moneyline[catalogue[x].event.id].awayid = marketbook.runners[y].selectionId;
        //         }
        //         if (marketbook.runners[y].selectionId == catalogue[x].homeid)  {
        //           moneyline[catalogue[x].event.id].home = marketbook.runners[y].ex;
        //           moneyline[catalogue[x].event.id].homeid = marketbook.runners[y].selectionId
        //         }
        //         if (marketbook.runners[y].runnerName == 'draw') {
        //           moneyline[catalogue[x].event.id].draw = marketbook.runners[y].ex;
        //           moneyline[catalogue[x].event.id].drawid = marketbook.runners[y].selectionId;
        //         }
        //         moneyline[catalogue[x].event.id].marketid = marketbook.marketId
        //       }
        //     }
        //   }
        // }
  
        // if (catalogue[x].marketName == 'Handicap') {
        //   handicap[catalogue[x].event.id] = {};
        //   if (marketbook.runners) {
        //     for (var y in marketbook.runners) {
        //       if ((marketbook.runners[y].ex.availableToBack.length != 0) || (marketbook.runners[y].ex.availableToLay.length != 0)) {
        //         if (handicap[catalogue[x].event.id][marketbook.runners[y].handicap] == undefined) handicap[catalogue[x].event.id][marketbook.runners[y].handicap] = {}
        //         if (marketbook.runners[y].selectionId == catalogue[x].awayid) {
        //           handicap[catalogue[x].event.id][marketbook.runners[y].handicap].away = marketbook.runners[y].ex 
        //           handicap[catalogue[x].event.id][marketbook.runners[y].handicap].awayid = marketbook.runners[y].selectionId 
        //         }
        //         if (marketbook.runners[y].selectionId == catalogue[x].homeid) {
        //           handicap[catalogue[x].event.id][marketbook.runners[y].handicap].home = marketbook.runners[y].ex;
        //           handicap[catalogue[x].event.id][marketbook.runners[y].handicap].homeid = marketbook.runners[y].selectionId;
        //         }
        //         handicap[catalogue[x].event.id].marketid = marketbook.marketId
        //       }
        //     }
        //   }
        // }
  
        // if (catalogue[x].marketName == 'Total Points') {
        //   totals[catalogue[x].event.id] = {};
        //   if (marketbook.runners) {
        //     for (var y in marketbook.runners) {
        //       if ((marketbook.runners[y].ex.availableToBack.length != 0) || (marketbook.runners[y].ex.availableToLay.length != 0)) {
        //         if (totals[catalogue[x].event.id][marketbook.runners[y].handicap] == undefined) totals[catalogue[x].event.id][marketbook.runners[y].handicap] = {}
        //         if (marketbook.runners[y].selectionId == catalogue[x].awayid) {
        //           totals[catalogue[x].event.id][marketbook.runners[y].handicap].under = marketbook.runners[y].ex;
        //           totals[catalogue[x].event.id][marketbook.runners[y].handicap].underid = marketbook.runners[y].selectionId;
        //         } 
        //         if (marketbook.runners[y].selectionId == catalogue[x].homeid) {
        //           totals[catalogue[x].event.id][marketbook.runners[y].handicap].over = marketbook.runners[y].ex;
        //           totals[catalogue[x].event.id][marketbook.runners[y].handicap].overid = marketbook.runners[y].selectionId;
        //         } 
        //         totals[catalogue[x].event.id].marketid = marketbook.marketId
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

  var ret = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
  marketbook = marketbook.concat(ret.data);

  var funcs = [];

  for (var x in marketbook) {

    var marketdata = {};
    var moneyline = {};

    moneyline.away = marketbook[x].runners[0].ex;
    moneyline.awayid = marketbook[x].runners[0].selectionId;
    moneyline.home = marketbook[x].runners[1].ex;
    moneyline.homeid = marketbook[x].runners[1].selectionId;

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
  stakemode.fixfrom = 0;
  stakemode.fixto = 0;
  stakemode.percentfrom = 0;
  stakemode.percentto = 0;
  stakemode.fixed = 0;
  stakemode.percent = 0;
  stakemode.max = 0;
  stakemode.state = false;

  var tmp = await odds.findOne({site: 'betfair', sportId: sportId, eventId: events[marketbook[x].marketId]});
    if (tmp == null) {
      tmp = new odds({
        site: 'betfair',
        mornitId: monitid,
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
        stakemode: stakemode,
        market: [market]
      })
    }
    else {
      tmp.market.push(market);
      tmp.update = update;
    }
    await tmp.save()
}

module.exports.getBtOdds = getBtOdds;