require("dotenv").config();

const cron = require('node-cron');

const { getBtOdds } = require('./../lib/betfair');

const updateBetfairOdds = () => {
  cron.schedule("*/10 * * * * *", function() {
    try {
      getBtOdds(7522, [10547864], ['Moneyline', 'Total Points', 'Handicap'], false, "hamish@beausant.com.au", "TommyBay2015@");
    } catch (error) {
      console.log('updateBetfairOdds', error);
    }
  });
}
module.exports.updateBetfairOdds = updateBetfairOdds;
