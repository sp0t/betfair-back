require("dotenv").config();

const cron = require('node-cron');

const { setBetState } = require('./../lib/setbetstate');

const runsetBetState = () => {
  cron.schedule("*/4 * * * * *", function() {
    try {
        setBetState();
    } catch (error) {
      console.log('setBetState', error);
    }
  });
}
module.exports.runsetBetState = runsetBetState;
