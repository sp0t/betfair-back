require("dotenv").config();
const {auth} = require('../models/auth');
const {balance} = require('../models/balance');
const {formula} = require('../models/formula');
const {stakemode} = require('../models/stakemode');
const { v4: uuidv4 } = require('uuid');

var mongoose = require('mongoose');
mongoose.connect(process.env.DB_HOST+'/'+process.env.DB_NAME, {useNewUrlParser: true, useUnifiedTopology: true})
var mongoDB = mongoose.connection;

mongoDB.once('open', async() => {
    console.log('MongoDB connect......');
    console.log('inserting auth collection...')
    try {
        await auth.insertMany([
            {
                site:'betfair', 
                username: 'hamish@beausant.com.au',
                password: 'TommyBay2015@'
            },
            {
                site:'ps3838', 
                username: 'PW7110000P',
                password: 'Password1!'
            }
        ]);
        console.log('inserting auth collection success');
    } catch (error) {
        console.log('inserting auth collection error')
        console.error(error)
    }
    try {
        await balance.insertMany([
            {
                max: 5,
                available: 5
            }
        ]);
        console.log('inserting balance collection success');
    } catch (error) {
        console.log('inserting balance collection error')
        console.error(error)
    }
    
    try {
        const id = uuidv4();

        await formula.insertMany([
            {
                id: id,
                formula: 'f = (p * (d - 1) - q) / (d - 1)'
            }
        ]);
        console.log('inserting formula collection success');
    } catch (error) {
        console.log('inserting formula collection error')
        console.error(error)
    }

    try {
        await stakemode.insertMany([
            {
                edge: 15,
                max: 1,
                kellybalance: 1
            }
        ]);
        console.log('inserting stakemode collection success');
    } catch (error) {
        console.log('inserting stakemode collection error')
        console.error(error)
    }
    
});
  
