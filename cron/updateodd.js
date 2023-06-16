require("dotenv").config();

const cron = require('node-cron');
const { monitor } = require('../models/monitor')
const { auth } = require('../models/auth')

const { getBtOdds } = require('../lib/betfair');
const { getPsOdds } = require('../lib/ps3838');
const { genBtToken, genPsToken } = require('../lib/token')

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

const updateodds = async() => {
  // await genBtToken();
  // await genPsToken();

  cron.schedule("*/3 * * * * *", async() => {
    try {
      var funcs = [];
      var [monitors, session] = await Promise.all([
         monitor.find({monit: true}),
         auth.find({})
      ]);

      var pstoken = '';
      var bttoken = '';

      for (var x in session) {
        if (session[x].site == 'betfair')
          bttoken = session[x].token;
        if (session[x].site == 'ps3838')
          pstoken = session[x].token;
      }

      var updatetm = new Date().getTime() + 3000;

      if ((monitors.length != 0) && (session.length != 0)) {
        for (var x in monitors) {
          for (var y in monitors[x].sites) {
            if (monitors[x].sites[y].name == 'betfair') {
              funcs.push(getBtOdds(monitors[x].monitId, monitors[x].sport, monitors[x].sites[y].sportid, monitors[x].sites[y].competition[0], ['Moneyline', 'Total Points', 'Handicap'], monitors[x].playmode, bttoken, convertDate(updatetm)))
            }

            if (monitors[x].sites[y].name == 'ps3838') {
              funcs.push(getPsOdds(monitors[x].monitId, monitors[x].sport, monitors[x].sites[y].sportid, monitors[x].sites[y].competition[0], 0, monitors[x].playmode, pstoken, convertDate(updatetm)))
            }
          }
        }
        var ret = await Promise.all(funcs);
      }
    } catch (error) {
      console.log('updateodds', error);
    }
  });
}
module.exports.updateodds = updateodds;
