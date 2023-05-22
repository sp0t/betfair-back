require("dotenv").config();
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})

const { runplacebet } = require('./../cron/placebet');

runplacebet()