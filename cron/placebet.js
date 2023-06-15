require("dotenv").config();

const cron = require('node-cron');

const { placebet } = require('./../lib/placebet');
const { monitor } = require('../models/monitor');
const { stakemode } = require('../models/stakemode');
const { auth } = require('../models/auth')

const runplacebet = () => {
  cron.schedule("*/3 * * * * *", async() => {
    var [monitors, stakemodes, seesion] = await Promise.all([
       monitor.find({betting: true}),
       stakemode.find({}),
       auth.find({site: 'betfair'})
    ]); 

    if ((monitors.length != 0) && (seesion.length != 0)) {
      var funcs = []
      for (var x in monitors) {
        funcs.push(placebet(monitors[x].monitId, monitors[x].sport, monitors[x].sites[0].competition[0], stakemodes, seesion[0].token, monitors[x].kellymode));
      }
  
      var rets = await Promise.all(funcs)
    } 
  });
}
module.exports.runplacebet = runplacebet;
