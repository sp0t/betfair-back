require("dotenv").config();

const cron = require('node-cron');

const { placebet } = require('./../lib/placebet');
const { mornitor } = require('./../models/mornitor');
const { betrate } = require('../models/stakemode');
const { auth } = require('./../models/auth')

const runplacebet = () => {
  cron.schedule("*/3 * * * * *", async() => {
    var [mornitors, betrates, seesion] = await Promise.all([
       mornitor.find({state: true}),
       betrate.find({}),
       auth.find({site: 'betfair'})
    ]); 

    console.log('place betting start.......');

    if ((mornitors.length != 0) && (betrate.length != 0) && (seesion.length != 0)) {
      var funcs = []
      for (var x in mornitors) {
          for (var y in mornitors[x].sites[0].competition) {
              funcs.push(placebet(mornitors[x].sites[0].name, mornitors[x].sites[0].competition[y], mornitors[x].sites[1].name, mornitors[x].sites[1].competition[y], betrates, seesion[0]));
          }
      }
  
      var rets = await Promise.all(funcs)
    } 
  });
}
module.exports.runplacebet = runplacebet;
