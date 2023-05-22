const axios = require("axios");

const { odds } = require('./../models/odds');

const authPs = (useranme, password) => {
  var authorization = useranme + ':' + password;
  return ('Basic ' + Buffer.from(authorization, 'utf-8').toString('base64'));
}
module.exports.authPs = authPs;

const getPsOdds = async(sportId, leagueids, lineId, isLive, token) => {
  var options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    params: {
      sportId: sportId,
      leagueIds: leagueids.join(','),
    }
  };

  // console.log('============================>1')

  if (isLive) {
    options.params.isLive = 1;
  }

  var [oddData, fixtureData] = await Promise.all([
    axios.get("https://api.ps3838.com/v3/odds", options),
    axios.get("https://api.ps3838.com/v3/fixtures", options)
  ]);

  // console.log('============================>2')

  if (oddData.data.leagues && fixtureData.data.league) {
    oddData = oddData.data.leagues;
    fixtureData = fixtureData.data.league;

    var eventsFromOdd = {}

    for (var x in oddData) {
      var leagueId = oddData[x].id;
      for (var y in oddData[x].events) {
        var event = oddData[x].events[y];
        var odd = null;
        for (var z in event.periods) {
          if (event.periods[z].number == lineId) {
            odd = event.periods[z];
            break;
          }
        }
        if (odd != null) {
          eventsFromOdd[event.id] = odd;
          eventsFromOdd[event.id].leagueId = leagueId;
        }
      }
    }
  }

  // console.log('============================>3')

  for (var x in fixtureData) {
    var leagueName = fixtureData[x].name
    for (var y in fixtureData[x].events) {
      var eventId = fixtureData[x].events[y].id;
      if (eventsFromOdd[eventId] != undefined) {
        eventsFromOdd[eventId].leagueName = leagueName;
        eventsFromOdd[eventId].home = fixtureData[x].events[y].home;
        eventsFromOdd[eventId].away = fixtureData[x].events[y].away;
      }
    }
  }

  for (var x in eventsFromOdd) {
    var tmp = await odds.findOne({site: 'ps3838', sportId: sportId, eventId: x})
    var market = { updatedAt: new Date().getTime() }
    if (eventsFromOdd[x].moneyline) market.moneyline = eventsFromOdd[x].moneyline;
    if (eventsFromOdd[x].spreads) {
      market.handicap = {};
      for (var y in eventsFromOdd[x].spreads) {
        market.handicap[eventsFromOdd[x].spreads[y].hdp] = {};
        market.handicap[eventsFromOdd[x].spreads[y].hdp].away = eventsFromOdd[x].spreads[y].away;
        market.handicap[eventsFromOdd[x].spreads[y].hdp].home = eventsFromOdd[x].spreads[y].home;
        if (eventsFromOdd[x].spreads[y].max) market.handicap[eventsFromOdd[x].spreads[y].hdp].max = eventsFromOdd[x].spreads[y].max;
      }
    }

    if (eventsFromOdd[x].totals) {
      market.totals = {};
      for (var y in eventsFromOdd[x].totals) {
        market.totals[eventsFromOdd[x].totals[y].points] = {};
        market.totals[eventsFromOdd[x].totals[y].points].over = eventsFromOdd[x].totals[y].over;
        market.totals[eventsFromOdd[x].totals[y].points].under = eventsFromOdd[x].totals[y].under;
        if (eventsFromOdd[x].totals[y].max) market.totals[eventsFromOdd[x].totals[y].points].max = eventsFromOdd[x].totals[y].max;
      }
    }

    if (tmp == null) {
      tmp = new odds({
        site: 'ps3838',
        sportId: sportId,
        competitionId: eventsFromOdd[x].leagueId,
        competitionName: eventsFromOdd[x].leagueName,
        eventId: x,
        home: eventsFromOdd[x].home,
        away: eventsFromOdd[x].away,
        update: marketdata.updatedAt,
        market: [market]
      })
    }
    else {
      tmp.market.push(market);
      tmp.update = marketdata.updatedAt;
    }
    await tmp.save()
  }

  console.log("--------------------------")
  console.log('ps3838=========>', eventsFromOdd[x].away, eventsFromOdd[x].home)
}
module.exports.getPsOdds = getPsOdds;