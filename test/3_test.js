require("dotenv").config();
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})
var id = '32361812';
const { odds } = require('./../models/odds');
const run = async() => {
  try {
    console.log('start')
    var betdata = await odds.find({eventId: '32361811'});
    console.log(betdata)
    // betdata.state = 2;
    // await betdata.save();
  } catch (error) {
   console.error(error);
  }
}

run()