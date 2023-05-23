require("dotenv").config();
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})
var id = '32361812';
const { mornitor } = require('./../models/mornitor');
const { betrate } = require('./../models/betrate');
const run = async() => {
  try {
    console.log('start')
    var betdata = await betrate.find({});
    console.log(betdata)
    // betdata.state = 2;
    // await betdata.save();
  } catch (error) {
   console.error(error);
  }
}

run()