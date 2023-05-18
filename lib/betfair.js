const axios = require("axios");

const { odds } = require('./../models/odds');

const getBtOdds = async(sportId, leagueids, market, inPlayOnly, username, password) => {

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
    if (catalogue[x].marketName == market) {
      if (market == 'Moneyline') {
        catalogue[x]['away'] = catalogue[x].runners[0].runnerName;
        catalogue[x]['home'] = catalogue[x].runners[1].runnerName;
      }
      else {
        for (y in catalogue) {
          if ((catalogue[x].event.id == catalogue[y].event.id) && (catalogue[x].marketName == 'Moneyline')) {
            catalogue[x]['away'] = catalogue[y].runners[0].runnerName;
            catalogue[x]['home'] = catalogue[y].runners[1].runnerName;
            break;
          }
        }
      }
      
      data = {
        "marketIds": [catalogue[x].marketId],
        "priceProjection": {
            "priceData": ["EX_BEST_OFFERS", "EX_TRADED"]
        } 
      }
  
      var marketbook = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/', data, options);
      marketbook = marketbook.data[0];
  
      catalogue[x].odds = [];
      for ( y in catalogue[x].runners) {
        var temp = {};
        temp.runnerName = catalogue[x].runners[y].runnerName;
        temp.handicap = catalogue[x].runners[y].handicap;
        if (marketbook.runners[y].ex) temp.ex = marketbook.runners[y].ex;
        catalogue[x].odds.push(temp)
      }
  
      var tmp = await odds.findOne({site: 'betfair', sportId: sportId, eventId: catalogue[x].event.id})
      var market = { updatedAt: new Date().getTime() }
      if (tmp == null) {
        tmp = new odds({
          site: 'betfair',
          sportId: sportId,
          competitionId: catalogue[x].competition.id,
          competitionName: catalogue[x].competition.name,
          eventId: catalogue[x].event.id,
          home: catalogue[x].home,
          away: catalogue[x].away,
          market: catalogue[x].odds
        })
      }
      else {
        tmp.market.push(catalogue[x].odds);
      }
      await tmp.save()

    console.log("--------------------------")
    console.log('betfair====================>', catalogue[x].away, catalogue[x].home)
    }
  }
}
module.exports.getBtOdds = getBtOdds;