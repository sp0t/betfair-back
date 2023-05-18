require("dotenv").config();
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})

const { authPs, getPsOdds } = require('./../lib/ps3838');

const run = async() => {
  var token = authPs("PW7110000P", "Password1!");
  await getPsOdds(4, [487], 0, false, token);
}
run()