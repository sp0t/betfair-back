require("dotenv").config();

const cron = require('node-cron');

const { placebet } = require('./../lib/placebet');
const { mornitor } = require('./../models/mornitor');
const { betrate } = require('./../models/betrate');

const runplacebet = () => {
  cron.schedule("*/4 * * * * *", async() => {
    var [mornitors, betrates] = await Promise.all([
      mornitor.find({state: '0'}),
      betrate.find({})
    ]); 

    var funcs = []
    for (var x in mornitors) {
        for (var y in mornitors[x].sites[0].competition) {
            funcs.push(placebet(mornitors[x].sites[0].name, mornitors[x].sites[0].competition[y], mornitors[x].sites[1].name, mornitors[x].sites[1].competition[y], betrates));
        }
    }

    var rets = await Promise.all(funcs)
    
  });
}
module.exports.runplacebet = runplacebet;
