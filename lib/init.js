require("dotenv").config();
const {auth} = require('./../models/auth')
const {betrate} = require('./../models/betrate')
const {mornitor} = require('./../models/mornitor')
const {odds} = require('./../models/odds')

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


    console.log('inserting mornitor collection...')
    try {
        await mornitor.insertMany([
            {
                sport:'Basketball', 
                market: 'moneyline',
                sites: [
                    {
                        name: 'betfair',
                        sportid: 7522,
                        competition: [
                            10547864
                        ]
                    },
                    {
                        name: 'ps3838',
                        sportid: 4,
                        competition: [
                            487
                        ]
                    }
                ],
                state: false
            },
            {
                sport:'Football', 
                market: 'moneyline',
                sites: [
                    {
                        name: 'betfair',
                        sportid: 66598,
                        competition: [
                            2888729
                        ]
                    },
                    {
                        name: 'ps3838',
                        sportid: 15,
                        competition: [
                            204168
                        ]
                    }
                ],
                state: false
            },
            {
                sport:'Baseball', 
                market: 'moneyline',
                sites: [
                    {
                        name: 'betfair',
                        sportid: 7522,
                        competition: [
                            11196870
                        ]
                    },
                    {
                        name: 'ps3838',
                        sportid: 3,
                        competition: [
                            246
                        ]
                    }
                ],
                state: false
            },
            {
                sport:'Volleyball', 
                market: 'moneyline',
                sites: [
                    {
                        name: 'betfair',
                        sportid: 998917,
                        competition: [
                            10543862
                        ]
                    },
                    {
                        name: 'ps3838',
                        sportid: 34,
                        competition: [
                            4280
                        ]
                    }
                ],
                state: false
            },
        ]);
    } catch (error) {
        console.log('inserting mornitor collection error')
        console.error(error)
    } 
    
    console.log('betrate collection data...')
    try {
        const result = await betrate.find({})
        console.log(result)
    } catch (error) {
        console.error(error)
    }

    console.log('inserting mornitor collection success');
});
  
