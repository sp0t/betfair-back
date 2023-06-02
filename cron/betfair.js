require("dotenv").config();

const cron = require('node-cron');
const { mornitor } = require('./../models/mornitor')
const { auth } = require('./../models/auth')

const { getBtOdds } = require('./../lib/betfair');
const { authPs, getPsOdds } = require('./../lib/ps3838');

const updateBetfairOdds = () => {
  cron.schedule("*/3 * * * * *", async() => {
    try {
      var funcs = [];
      var [monitor, session] = await Promise.all([
         mornitor.find({monit: true}),
         auth.find({})
      ]);

      var updatetm = new Date().getTime() + 3000;

      if ((monitor.length != 0) && (session.length != 0)) {
        var token = authPs(session[1].username, session[1].password);
        for (var x in monitor) {
          for (var y in monitor[x].sites) {
            if (monitor[x].sites[y].name == 'betfair') {
              funcs.push(getBtOdds(monitor[x].sites[y].sportid, monitor[x].sites[y].competition, ['Moneyline', 'Total Points', 'Handicap'], monitor[x].playmode, session[0].username, session[0].password, monitor[x].sport, monitor[x].id, updatetm, ))
            }

            if (monitor[x].sites[y].name == 'ps3838') {
              funcs.push(getPsOdds(monitor[x].sites[y].sportid, monitor[x].sites[y].competition, 0, monitor[x].playmode, token, monitor[x].sport, monitor[x].id, updatetm))
            }
          }
        }
        var ret = await Promise.all(funcs);
      }
    } catch (error) {
      console.log('updateBetfairOdds', error);
    }
  });
}
module.exports.updateBetfairOdds = updateBetfairOdds;
