require("dotenv").config();

const cron = require('node-cron');

const { placebet } = require('./../lib/placebet');
const { mornitor } = require('./../models/mornitor');

const runplacebet = () => {
  cron.schedule("*/4 * * * * *", async() => {
    var tmp = await mornitor.find({state: '0'});
    var funcs = []
    for (var x in tmp) {
        for (var y in tmp[x].sites[0].competition) {
            funcs.push(placebet(tmp[x].sites[0].name, tmp[x].sites[0].competition[y], tmp[x].sites[1].name, tmp[x].sites[1].competition[y]));
        }
    }

    var rets = await Promise.all(funcs)
    
    // for (var x in tmp) {
    //     funcs.push(getDepositMaxGas(chains[x], ids[y]))
    // }
    // try {
    //     setBetState();
    // } catch (error) {
    //   console.log('setBetState', error);
    // }
  });
}
module.exports.runplacebet = runplacebet;
