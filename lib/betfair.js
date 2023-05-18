const axios = require("axios");

const { odds } = require('./../models/odds');

const getBtOdds = async(sportId, leagueids, marketid, inPlayOnly, username, password) => {

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
  var data = {
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

  for (x in catalogue) {
    if (marketid.includes(catalogue[x].marketName)) {
      if (marketid == 'Moneyline') {
        catalogue[x]['away'] = catalogue[x].runners[0].runnerName;
        catalogue[x]['home'] = catalogue[x].runners[1].runnerName;
        catalogue[x]['awayid'] = catalogue[x].runners[0].selectionId;
        catalogue[x]['homeid'] = catalogue[x].runners[1].selectionId;
      }
      else {
        for (y in catalogue) {
          if ((catalogue[x].event.id == catalogue[y].event.id) && (catalogue[x].marketName == 'Moneyline')) {
            catalogue[x]['away'] = catalogue[y].runners[0].runnerName;
            catalogue[x]['home'] = catalogue[y].runners[1].runnerName;
            catalogue[x]['awayid'] = catalogue[x].runners[0].selectionId;
            catalogue[x]['homeid'] = catalogue[x].runners[1].selectionId;
            break;
          }
        }
      }

      // var marketbook = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
      // marketbook = marketbook.data[0];
      // var market = { updatedAt: new Date().getTime() }

      // if (catalogue[x].marketName == 'Moneyline') {
      //   market.moneyline = {};
      //   if (marketbook.runners) {
      //     for (var y in marketbook.runners) {
      //       if (marketbook.runners[y].selectionId == catalogue[x].awayid)  market.moneyline.away = marketbook.runners[y].ex
      //       if (marketbook.runners[y].selectionId == catalogue[x].homeid)  market.moneyline.home = marketbook.runners[y].ex
      //     }
      //   }
      // }

      console.log(catalogue[x])
      
      // data = {
      //   "marketIds": [catalogue[x].marketId],
      //   "priceProjection": {
      //       "priceData": ["EX_BEST_OFFERS", "EX_TRADED"]
      //   } 
      // }
  
      // var marketbook = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
      // marketbook = marketbook.data[0];
  
      // var market = { updatedAt: new Date().getTime() }
      // for ( y in catalogue[x].runners) {
      //   market.runnerName = catalogue[x].runners[y].runnerName;
      //   market.handicap = catalogue[x].runners[y].handicap;
      //   if (marketbook.runners[y].ex) temp.ex = marketbook.runners[y].ex;
      //   catalogue[x].odds.push(temp)
      // }
  
      // var tmp = await odds.findOne({site: 'betfair', sportId: sportId, eventId: catalogue[x].event.id})
      // if (tmp == null) {
      //   tmp = new odds({
      //     site: 'betfair',
      //     sportId: sportId,
      //     competitionId: catalogue[x].competition.id,
      //     competitionName: catalogue[x].competition.name,
      //     eventId: catalogue[x].event.id,
      //     home: catalogue[x].home,
      //     away: catalogue[x].away,
      //     market: [market]
      //   })
      // }
      // else {
      //   tmp.market.push(catalogue[x].odds);
      // }
      // await tmp.save()
    }
  }
}
module.exports.getBtOdds = getBtOdds;