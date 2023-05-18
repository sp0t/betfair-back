require("dotenv").config();
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})

const { getBtOdds } = require('./../lib/betfair');

const run = async() => {
  await getBtOdds(7522, [10547864], 'Moneyline', false, "hamish@beausant.com.au", "TommyBay2015@");
}
run()