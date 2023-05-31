const axios = require("axios");

const { odds } = require('./../models/odds');

const authPs = (useranme, password) => {
  var authorization = useranme + ':' + password;
  return ('Basic ' + Buffer.from(authorization, 'utf-8').toString('base64'));
}
module.exports.authPs = authPs;

const getPsOdds = async(sportId, leagueids, lineId, isLive, token, sportname, mornitid, tm) => {
  
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

  if (isLive) {
    options.params.isLive = 1;
  }

  var [oddData, fixtureData] = await Promise.all([
    axios.get("https://api.ps3838.com/v3/odds", options),
    axios.get("https://api.ps3838.com/v3/fixtures", options)
  ]);

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
        eventsFromOdd[eventId].matchday = fixtureData[x].events[y].starts
      }
    }
  }

  var funcs = [];

  for (var x in eventsFromOdd) {
    var market = {}
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

    if(market.hasOwnProperty('moneyline'))
      funcs.push(saveData(sportId, mornitid, sportname, eventsFromOdd[x].leagueId,  eventsFromOdd[x].leagueName, x, '0', eventsFromOdd[x].away, eventsFromOdd[x].home, tm, eventsFromOdd[x].matchday, marketdata));
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

  var tmp = await odds.findOne({site: 'ps3838', sportId: sportId, eventId: eventId});
    if (tmp == null) {
      tmp = new odds({
        site: 'ps3838',
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

module.exports.getPsOdds = getPsOdds;