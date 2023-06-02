require("dotenv").config();

const cron = require('node-cron');

const { placebet } = require('./../lib/placebet');
const { mornitor } = require('./../models/mornitor');
const { stakemode } = require('../models/stakemode');
const { auth } = require('./../models/auth')

const runplacebet = () => {
  cron.schedule("*/3 * * * * *", async() => {
    var [mornitors, stakemodes, seesion] = await Promise.all([
       mornitor.find({betting: true}),
       stakemode.find({}),
       auth.find({site: 'betfair'})
    ]); 

    if ((mornitors.length != 0) && (stakemode.length != 0) && (seesion.length != 0)) {
      var funcs = []
      for (var x in mornitors) {
          funcs.push(placebet(mornitors[x].sites[0].name, mornitors[x].sites[0].competition[0], mornitors[x].sites[1].name, mornitors[x].sites[1].competition[0], stakemodes, seesion[0]));
      }
  
      var rets = await Promise.all(funcs)
    } 
  });
}
module.exports.runplacebet = runplacebet;
