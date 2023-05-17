require("dotenv").config();

const cron = require('node-cron');

const { authPs, getPsOdds } = require('./../lib/ps3838');

const updatePs3838Odds = () => {
  cron.schedule("*/10 * * * * *", function() {
    try {
      var token = authPs("PW7110000P", "Password1!");
      getPsOdds(4, [487], 0, false, token);
    } catch (error) {
      console.log('updatePs3838Odds', error);
    }
  });
}
module.exports.updatePs3838Odds = updatePs3838Odds;
