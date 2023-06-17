require("dotenv").config();

const cron = require('node-cron');
const { auth } = require('../models/auth')

const { setBetState } = require('./../lib/setbetstate');
const { auth } = require('../models/auth');

const runsetBetState = () => {
  cron.schedule("*/3 * * * * *", function() {
    var ret = auth.find({site: 'betfair'})
    console.log(ret)
    try {
        setBetState(ret[0].token);
    } catch (error) {
      console.log('setBetState', error);
    }
  });
}
module.exports.runsetBetState = runsetBetState;
