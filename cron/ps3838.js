require("dotenv").config();

const cron = require('node-cron');
const { mornitor } = require('./../models/mornitor')
const { auth } = require('./../models/auth')

const { authPs, getPsOdds } = require('./../lib/ps3838');

const updatePs3838Odds = () => {
  cron.schedule("*/3 * * * * *", async() => {
    try {
      var funcs = [];
      var [monitor, session] = await Promise.all([
         mornitor.find({}),
         auth.find({site: 'ps3838'})
      ]);

      var token = authPs(session[0].username, session[0].password);

      for (var x in monitor) {
        for (var y in monitor[x].sites) {
          if (monitor[x].sites[y].name == 'ps3838') {
            funcs.push(getPsOdds(monitor[x].sites[y].sportid, monitor[x].sites[y].competition, 0, false, token))
          }
        }
      }
      var ret = await Promise.all(funcs);
    } catch (error) {
      console.log('updatePs3838Odds', error);
    }
  });
}
module.exports.updatePs3838Odds = updatePs3838Odds;
