const { match } = require('../models/match');
const { odds } = require('../models/odds');
const { bet } = require('../models/bet');
const AWS = require('aws-sdk');

const setBetState = async() => {
    var current = new Date().getTime();
    var data = await match.find({state: 0});
    var funcs = [];

    for (x in data) {
        var update = new Date(data[x].update).getTime();

        if (current - update > 60000) {
            funcs.push(uploadToS3Buckt(data[x]));
            data[x].state = 1;
            await data[x].save();
        }
    }

    if (funcs.length != 0)
    var ret = await Promise.all(funcs);
}

const uploadToS3Buckt = async(data) => {
    var s3data = {};
    var [psodd, btodd] = await Promise.all([
        await odds.find({site:'ps3838', monitId:data.monitId, away:data.away, home:data.home, state: 0}),
        await odds.find({site:'betfair', monitId:data.monitId, away:data.away, home:data.home, state: 0})
        ])

    psodd[0].state = 1;
    btodd[0].state = 1;

    var [ret1, ret2] = await Promise.all([
        await psodd[0].save(),
        await btodd[0].save()
    ])

    s3data.betdata = {};
    if (data.betid != '0') {
        var ret = await bet.find({betid: data.betid});
        if (ret != undefined) {
            s3data.betdata.betplace = ret[0].place;
            s3data.betdata.betdate = ret[0].betdate;
            s3data.betdata.betodd = ret[0].odds;
            s3data.betdata.stake = ret[0].stake;
            s3data.betdata.market = ret[0].market;
            s3data.betdata.odds = {};
            s3data.betdata.odds.betfair = {};
            s3data.betdata.odds.betfair.away = ret[0].betfair.away;
            s3data.betdata.odds.betfair.home = ret[0].betfair.home;
            s3data.betdata.odds.ps3838 = {};
            s3data.betdata.odds.ps3838.away = ret[0].other.away;
            s3data.betdata.odds.ps3838.home = ret[0].other.home;
            if (ret[0].state == 0) s3data.state = 'InPlay';
            if (ret[0].state == 1) s3data.state = 'Lose';
            if (ret[0].state == 2) s3data.state = 'Win';
        }
    }

    {
        var betfair = [];
        var ps3838 = [];
        var x = 0;
        var y = 0;
    
        
        while (x < btodd[0].market.length || y < psodd[0].market.length) {
          var psdata = {};
          var btdata = {};
          const date1 = new Date(btodd[0].market[x]).update;
          const date2 = new Date(psodd[0].market[y]).update;

          if (date1 > date2) {
            psdata.update = psodd[0].market[y].update;
            btdata.update = psodd[0].market[y].update;
            psdata.away = psodd[0].market[y].moneyline.away;
            psdata.home = psodd[0].market[y].moneyline.home;
    
            if (x == 0) {
                btdata.away = btodd[0].market[0].moneyline.away.availableToBack[0].price;
                btdata.home = btodd[0].market[0].moneyline.home.availableToBack[0].price;
            } else {
                btdata.away = btodd[0].market[x-1].moneyline.away.availableToBack[0].price;
                btdata.home = btodd[0].market[x-1].moneyline.home.availableToBack[0].price;
            }
    
            y++;
            
          }else if (date1 < date2) {
            psdata.update = btodd[0].market[x].update;
            btdata.update = btodd[0].market[x].update;
            btdata.away = btodd[0].market[x].moneyline.away.availableToBack[0].price;
            btdata.home = btodd[0].market[x].moneyline.home.availableToBack[0].price;
    
            if (y == 0) {
                psdata.away = psodd[0].market[0].moneyline.away;
                psdata.home = psodd[0].market[0].moneyline.home;
            } else {
              psdata.away = psodd[0].market[y-1].moneyline.away;
              psdata.home = psodd[0].market[y-1].moneyline.home;
            }
    
            x++;
          } else {
    
            if (btodd[0].market[x] == undefined) {
              psdata.update = psodd[0].market[y].update;
              btdata.update = psodd[0].market[y].update;
              btdata.away = btodd[0].market[x-1].moneyline.away.availableToBack[0].price;
              btdata.home = btodd[0].market[x-1].moneyline.home.availableToBack[0].price;
              psdata.away = psodd[0].market[y].moneyline.away;
              psdata.home = psodd[0].market[y].moneyline.home;
              y++;
            } else if (psodd[0].market[y] == undefined) {
              psdata.update = btodd[0].market[x].update;
              btdata.update = btodd[0].market[x].update;
              btdata.away = btodd[0].market[x].moneyline.away.availableToBack[0].price;
              btdata.home = btodd[0].market[x].moneyline.home.availableToBack[0].price;
              psdata.away = psodd[0].market[y-1].moneyline.away;
              psdata.home = psodd[0].market[y-1].moneyline.home;
              x++;
            } else {
              psdata.update = btodd[0].market[x].update;
              btdata.update = btodd[0].market[x].update;
              btdata.away = btodd[0].market[x].moneyline.away.availableToBack != undefined ? btodd[0].market[x].moneyline.away.availableToBack[0].price: '-';
              btdata.home = btodd[0].market[x].moneyline.home.availableToBack != undefined ? btodd[0].market[x].moneyline.home.availableToBack[0].price: '-';
              psdata.away = psodd[0].market[y].moneyline.away;
              psdata.home = psodd[0].market[y].moneyline.home;
              x++;
              y++;
            }
          }
          betfair.push(btdata);
          ps3838.push(psdata);
        }

        s3data.odds = {};
        s3data.odds.betfair = betfair;
        s3data.odds.ps3838 = ps3838;

    }
    s3data.away = data.away;
    s3data.home = data.home;
    s3data.sport = data.sportName;
    s3data.gamedate = data.gamedate;

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    });

    const bucketName = process.env.AWS_BUCKET_NAME;
    const filename = `${s3data.away} VS ${s3data.home} (${s3data.sport}-${s3data.gamedate}).json`;

    console.log('bucketName==>', bucketName, '=====>filename', filename)

    const jsonString = JSON.stringify(s3data);

    const params = {
        Bucket: bucketName,
        Key: filename,
        Body: jsonString,
    };

    s3.upload(params, function(err, data) {
        if (err) {
            console.log('Error uploading JSON:', err);
        } else {
            console.log('JSON uploaded successfully:', data.Location);
        }
    });

}

module.exports.setBetState = setBetState;
