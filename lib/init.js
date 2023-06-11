require("dotenv").config();
const {auth} = require('../models/auth');
const {balance} = require('../models/balance');
const {formula} = require('../models/formula');
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
        await balance.insertOne(
            {
                max: 0,
                available: 0
            }
        );
        console.log('inserting balance collection success');
    } catch (error) {
        console.log('inserting balance collection error')
        console.error(error)
    }
    
    try {
        const id = uuidv4();

        await formula.insertOne(
            {
                id: id,
                formula: 'f = (p * (d - 1) -q) / (d - 1)'
            }
        );
        console.log('inserting balance collection success');
    } catch (error) {
        console.log('inserting balance collection error')
        console.error(error)
    }
});
  
