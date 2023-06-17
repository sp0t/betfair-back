require("dotenv").config();

const cron = require('node-cron');

const { sendstate } = require('./../lib/sendstate');

const runSendState = () => {
  cron.schedule("*/1 * * * * *", function() {
    try {
        sendstate();
    } catch (error) {
      console.log('setBetState', error);
    }
  });
}
module.exports.runSendState = runSendState;