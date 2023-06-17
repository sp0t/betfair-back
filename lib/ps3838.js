const axios = require("axios");

const { odds } = require('./../models/odds');
const { match } = require('./../models/match');
const { genPsToken } = require('../lib/token')

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

const getPsOdds = async(monitid, sportname, sportid, leagueid, lineId, isLive, token, tm, gstakemode) => {

  var timestamp1 = new Date();
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

  try {
    var [retodd, retfixture] = await Promise.all([
      axios.get("https://api.ps3838.com/v3/odds", oddOption),
      axios.get("https://api.ps3838.com/v3/fixtures", options)
    ]);
  } catch (error) {
    await genPsToken();
    return;
  }

  var funcs = [];

  if (retodd.data != '' && retfixture.data != '' && retodd.data != undefined && retfixture.data != undefined) {
    var leaugename = retfixture.data.league[0].name;
    var oddData = retodd.data.leagues[0].events;
    var fixtureData = retfixture.data.league[0].events;

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
          if (odd.moneyline != undefined) {
            if (odd.moneyline.away != undefined)
              market.moneyline.away = '-';
            else
              market.moneyline.away = odd.moneyline.away;
            if (odd.moneyline.home != undefined)
              market.moneyline.home = '-';
            else
              market.moneyline.home = odd.moneyline.home;
          }
          else {
            market.moneyline.away = '-';
            market.moneyline.home = '-';
          };

          market.spreads = {};
          // if (odd.spreads != undefined) {
          //   for (var x in odd.spreads) {
          //       market.spreads[odd.spreads[x].hdp] = {};
          //       market.spreads[odd.spreads[x].hdp].away = odd.spreads[x].away;
          //       market.spreads[odd.spreads[x].hdp].home = odd.spreads[x].home;
          //   }
          // }

          market.totals = {};
          // if (odd.totals != undefined) {
          //   for (var x in odd.totals) {
          //       market.totals[odd.totals[x].points] = {};
          //       market.totals[odd.totals[x].points].over = odd.totals[x].over;
          //       market.totals[odd.totals[x].points].under = odd.totals[x].under;
          //   }
          // }

          market.teamTotal = {}
          // if (odd.teamTotal != undefined)
          //   market.teamTotal = odd.teamTotal;

          market.update = tm;

          console.log(market)
          
          if (market.moneyline.away != '-' || market.moneyline.home != '-')
            funcs.push(saveData(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, tm, gstakemode));
        }
      }
    }
  }

  if (funcs.length != 0)
    var ret = await Promise.all([funcs]);

  var timestamp2 = new Date();
  console.log('PS3838 Time intaval =============>', timestamp2 - timestamp1);
}

const saveData = async(monitid, sportid, sportname, leagueid, leaugename, eventid, away, home, gamedate, market, update, gstakemode) => {

  console.log('saveData==========>')
  var odddata = {};

  if (market.moneyline != undefined) 
  {
    if (market.moneyline != undefined) {
      odddata.away = market.moneyline.away;
      odddata.home = market.moneyline.home;
    } else {
      odddata.away = '-';
      odddata.home = '-';
    }
  }

  var lstakemode = {};

  lstakemode.edge = gstakemode.edge;
  lstakemode.max = gstakemode.max;
  lstakemode.formula = 'f = (p * (d - 1) - q) / (d - 1)';
  lstakemode.kellybalance = gstakemode.kellybalance;
  lstakemode.awayamount = 0;
  lstakemode.homeamount = 0;
  lstakemode.state = false;

  var gameregex = gamedate.slice(0, 10);

  var [psodd, btodd, matchdata] = await Promise.all([
    odds.findOne({site: 'ps3838', monitId: monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0}),
    odds.findOne({site: 'betfair', monitId: monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0, update: update}),
    match.findOne({monitId:monitid, away: away, home: home, gamedate: { $regex: gameregex, $options: 'i' }, state: 0})
  ]);

  if (matchdata == null) {
    if (btodd == null) {
      lstakemode.awayamount = 0;
      lstakemode.homeamount = 0;
    } else {
      var btdata = btodd.market[btodd.market.length - 1]
      if (odddata.away == '-' || btdata.moneyline.away == '-')
        lstakemode.awayamount = 0;
      else {
        var p = 1 / (odddata.away * (1 + gstakemode.edge / 100))
        var q = 1 - p;
        var d = btdata.moneyline.away;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.awayamount = (gstakemode.kellybalance * probability).toFixed(3);
      }
  
      if (odddata.home == '-' || btdata.moneyline.home == '-')
        lstakemode.homeamount = 0;
      else {
        var p = 1 / (odddata.home * (1 + gstakemode.edge / 100))
        var q = 1 - p;
        var d = btdata.moneyline.home;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.homeamount = (gstakemode.kellybalance * probability).toFixed(3);
      }
    }
  } else {
    if (matchdata.stakemode.state) {
      lstakemode.edge = matchdata.stakemode.edge;
      lstakemode.max = matchdata.stakemode.max;
      lstakemode.kellybalance = matchdata.stakemode.kellybalance;
      lstakemode.state = matchdata.stakemode.state;
    }

    if (btodd == null) {
      lstakemode.awayamount = matchdata.stakemode.awayamount;
      lstakemode.homeamount = matchdata.stakemode.homeamount;
    } else {
      var btdata = btodd.market[btodd.market.length - 1]
      if (odddata.away == '-' || btdata.moneyline.away == '-')
        lstakemode.awayamount = matchdata.stakemode.awayamount;
      else {
        var p = 1 / (odddata.away * (1 + lstakemode.edge / 100))
        var q = 1 - p;
        var d = btdata.moneyline.away;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.awayamount = (lstakemode.kellybalance * probability).toFixed(3);
      }
  
      if (odddata.home == '-' || btdata.moneyline.home == '-')
        lstakemode.homeamount = matchdata.stakemode.homeamount;
      else {
        var p = 1 / (odddata.home * (1 + lstakemode.edge / 100))
        var q = 1 - p;
        var d = btdata.moneyline.home;
  
        var scope = {
          p: p,
          q: q,
          d: d
        };
        
        // Evaluate the formula using math.evaluate()
        var probability = (math.evaluate(lstakemode.formula, scope));
        lstakemode.homeamount = (lstakemode.kellybalance * probability).toFixed(3);
      }
    }
  }

  if (matchdata == null) {  
    matchdata = new match({
      monitId:monitid,
      sportName: '',
      competitionName: '',
      eventId: eventid,
      away: away,
      home: home,
      gamedate: gamedate,
      update: update,
      stakemode: lstakemode,
      ps3838odd: odddata
    })
  } else {
    matchdata.update = update;
    matchdata.ps3838odd = odddata;
    matchdata.stakemode = lstakemode;
  }

  if (psodd == null) {
    psodd = new odds({
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
    if ((psodd.market[psodd.market.length - 1].moneyline.away != market.moneyline.away) || (psodd.market[psodd.market.length - 1].moneyline.home != market.moneyline.home))
      psodd.market.push(market);
    psodd.update = update;
  }
  
  var [ret1, ret2] = await Promise.all([
    psodd.save(),
    matchdata.save(),
  ]);
}

module.exports.getPsOdds = getPsOdds;