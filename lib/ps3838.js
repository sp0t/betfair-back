const axios = require("axios");

const { odds } = require('./../models/odds');
const { match } = require('./../models/match');

const authPs = (useranme, password) => {
  var authorization = useranme + ':' + password;
  return ('Basic ' + Buffer.from(authorization, 'utf-8').toString('base64'));
}
module.exports.authPs = authPs;

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

const getPsOdds = async(monitid, sportname, sportid, leagueid, lineId, isLive, token, tm) => {

  var options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    params: {
      sportId: sportid,
      leagueIds: leagueid,
    }
  };

  if (isLive) {
    options.params.isLive = 1;
  }

  var oddOption = options;
  oddOption.params.oddsFormat = 'Decimal';

  var [retodd, retfixture] = await Promise.all([
    axios.get("https://api.ps3838.com/v3/odds", oddOption),
    axios.get("https://api.ps3838.com/v3/fixtures", options)
  ]);

  if (oddData.data.leagues != undefined && fixtureData.data.league != undefined) {
    var leaugename = retfixture.data.league[0].name;
    var oddData = retodd.data.leagues[0].events;
    var fixtureData = fixtureData.data.league[0].events;

    var funcs = [];

    for (var x in oddData) {
      var odd = (oddData[x].periods).find(el => el.number == lineId);
      if (odd != undefined) {
        var fixture = fixtureData.find(el => el.id == oddData[x].id);
        if (fixture != undefined) {

          var away = fixture.away;
          var home = fixture.home;
          var gamedate = convertDate(fixture.starts);
          var eventid = oddData[x].id;

          var market = {};

          market.marketid = odd.lineId;

          market.moneyline = {};
          if (odd.moneyline != undefined)
            market.moneyline = odd.moneyline;

          market.spreads = {};
          if (odd.spreads != undefined) {
            for (var x in odd.spreads) {
                market.spreads[odd.spreads[x].hdp] = {};
                market.spreads[odd.spreads[x].hdp].away = odd.spreads[x].away;
                market.spreads[odd.spreads[x].hdp].home = odd.spreads[x].home;
            }
          }

          market.totals = {};
          if (odd.totals != undefined) {
            for (var x in odd.totals) {
                market.totals[odd.totals[x].points] = {};
                market.totals[odd.totals[x].points].over = odd.totals[x].over;
                market.totals[odd.totals[x].points].under = odd.totals[x].under;
            }
          }

          market.teamTotal = {}
          if (odd.teamTotal != undefined)
            market.teamTotal = odd.teamTotal;

          market.update = tm;

          funcs.push(saveData(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, tm));
        }
      }
    }
  }

  if (funcs.length != 0)
    var ret = await Promise.all([funcs]);
}

const saveData = async(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, update) => {

  var odddata = {};

  if (market.moneyline != undefined) 
  {
    odddata.away = market.moneyline.away;
    odddata.home = market.moneyline.home;
  }

  var [odd, matchdata] = await Promise.all([
    odds.findOne({site: 'ps3838', sportId: sportid, eventId: eventid}),
    match.findOneAndUpdate({monitId:monitid, away: away, home: home, gamedate: gamedate, state: 0}, 
      {
        monitId:monitid,
        sportName: sportname,
        away: away,
        home: home,
        gamedate: gamedate,
        ps3838odd: odddata,
      }, {upsert: true, new: true, setDefaultsOnInsert: true})
  ])

  if (odd == null) {
    odd = new odds({
      site: 'ps3838',
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
    if ((odd.market[odd.market.length - 1].moneyline.away != market.moneyline.away) || (odd.market[odd.market.length - 1].moneyline.home != market.moneyline.home))
      odd.market.push(market);
    odd.update = update;
  }
  await odd.save()
}

module.exports.getPsOdds = getPsOdds;