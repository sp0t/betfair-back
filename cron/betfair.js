require("dotenv").config();

const cron = require('node-cron');
const { mornitor } = require('./../models/mornitor')
const { auth } = require('./../models/auth')

const { getBtOdds } = require('./../lib/betfair');

const updateBetfairOdds = () => {
  cron.schedule("*/3 * * * * *", async() => {
    try {
      var funcs = [];
      var [monitor, session] = await Promise.all([
         mornitor.find({state: true}),
         auth.find({site: 'betfair'})
      ]);

      for (var x in monitor) {
        for (var y in monitor[x].sites) {
          if (monitor[x].sites[y].name == 'betfair') {
            funcs.push(getBtOdds(monitor[x].sites[y].sportid, monitor[x].sites[y].competition, ['Moneyline', 'Total Points', 'Handicap'], false, session[0].username, session[0].password))
          }
        }
      }
      var ret = await Promise.all(funcs);
    } catch (error) {
      console.log('updateBetfairOdds', error);
    }
  });
}
module.exports.updateBetfairOdds = updateBetfairOdds;
