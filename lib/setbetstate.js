require("dotenv").config();
const { match } = require('../models/match');
const { odds } = require('../models/odds');
const { bet } = require('../models/bet');
const { balance } = require('../models/balance');
const AWS = require('aws-sdk');
const WebSocket = require('ws');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});

const setBetState = async(token) => {
    var current = new Date().getTime();
    var data = await match.find({state: 0});
    var funcs = [];

    for (x in data) {
        var update = new Date(data[x].update).getTime();

        if (current - update > 6000) {
            funcs.push(uploadToS3Buckt(data[x], token));
            data[x].state = 1;
            await data[x].save();
        }
    }

    if (funcs.length != 0)
        await Promise.all(funcs);
}

const uploadToS3Buckt = async(data, token) => {
    var s3data = {};
    var [psodd, btodd, gbalance] = await Promise.all([
        odds.find({site:'ps3838', monitId:data.monitId, away:data.away, home:data.home, state: 0}),
        odds.find({site:'betfair', monitId:data.monitId, away:data.away, home:data.home, state: 0}),
        balance.find({})
        ])

    if (psodd != undefined && btodd != undefined) {

        psodd[0].state = 1;
        btodd[0].state = 1;
    
        var [ret1, ret2] = await Promise.all([
            psodd[0].save(),
            btodd[0].save()
        ])
    
        s3data.betdata = {};
        if (data.betid != '0') {
            var options = {
                headers: {
                'X-Application': 'XCy3BR7EjehV32o3',
                'Accept':'application/json'
                }
            };
            options.headers['Content-type'] = "application/json";
            options.headers['X-Authentication'] = token;
            
            data = {
                "betStatus":"SETTLED",
                "betIds":[data.betid]
            }
        
            var [betdata, ret] = await Promise.all([
                bet.find({betid: matchdata.betid}),
                axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listClearedOrders/', data, options)
            ]) 
            
            if (ret.data.clearedOrders[0] != undefined) {
                if (ret.data.clearedOrders[0].betOutcome == 'WON') {
                gbalance[0].available = gbalance[0].available + ret.data.clearedOrders[0].profit + ret.data.clearedOrders[0].profit;
                if (gbalance[0].available >= gbalance[0].max)
                    gbalance[0].available = gbalance[0].max;
                betdata[0].state = 2;
                }
                else if (ret.data.clearedOrders[0].betOutcome == 'LOST')
                betdata[0].state = 1;
        
                var content = `Bet on ${away} vs ${home} in ${sportname}.\n(gamedate: ${gamedate} - ${ret.data.clearedOrders[0].betOutcome})`;
        
                            const embed = new EmbedBuilder()
                            .setTitle('Betfair')
                            .setColor(0xff0000);
        
                var senddata = {
                    type: 'betalarm',
                    data: content
                    }
                
                // Broadcast the match data to all connected clients
                wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(senddata));
                    }
                });
        
                await Promise.all([
                    gbalance[0].save(),
                    betdata[0].save(),
                    webhookClient.send({
                                    content: content,
                                    username: 'Betfair',
                                    avatarURL: 'https://i.imgur.com/oBPXx0D.png'
                                    // embeds: [embed],
                                })
                ])
            }
            var ret = await bet.find({betid: data.betid});
            if (ret != undefined) {
                s3data.betdata.betplace = betdata[0].place;
                s3data.betdata.betdate = betdata[0].betdate;
                s3data.betdata.betodd = betdata[0].odds;
                s3data.betdata.stake = betdata[0].stake;
                s3data.betdata.market = betdata[0].market;
                s3data.betdata.odds = {};
                s3data.betdata.odds.betfair = {};
                s3data.betdata.odds.betfair.away = betdata[0].betfair.away;
                s3data.betdata.odds.betfair.home = betdata[0].betfair.home;
                s3data.betdata.odds.ps3838 = {};
                s3data.betdata.odds.ps3838.away = betdata[0].other.away;
                s3data.betdata.odds.ps3838.home = betdata[0].other.home;
                if (betdata[0].state == 0) s3data.state = 'Pending';
                if (betdata[0].state == 1) s3data.state = 'Lose';
                if (betdata[0].state == 2) s3data.state = 'Win';
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
                    btdata.away = btodd[0].market[0].moneyline.away;
                    btdata.home = btodd[0].market[0].moneyline.home;
                } else {
                    btdata.away = btodd[0].market[x-1].moneyline.away;
                    btdata.home = btodd[0].market[x-1].moneyline.home;
                }
        
                y++;
                
              }else if (date1 < date2) {
                psdata.update = btodd[0].market[x].update;
                btdata.update = btodd[0].market[x].update;
                btdata.away = btodd[0].market[x].moneyline.away;
                btdata.home = btodd[0].market[x].moneyline.home;
        
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
                  btdata.away = btodd[0].market[x-1].moneyline.away;
                  btdata.home = btodd[0].market[x-1].moneyline.home;
                  psdata.away = psodd[0].market[y].moneyline.away;
                  psdata.home = psodd[0].market[y].moneyline.home;
                  y++;
                } else if (psodd[0].market[y] == undefined) {
                  psdata.update = btodd[0].market[x].update;
                  btdata.update = btodd[0].market[x].update;
                  btdata.away = btodd[0].market[x].moneyline.away;
                  btdata.home = btodd[0].market[x].moneyline.home;
                  psdata.away = psodd[0].market[y-1].moneyline.away;
                  psdata.home = psodd[0].market[y-1].moneyline.home;
                  x++;
                } else {
                  psdata.update = btodd[0].market[x].update;
                  btdata.update = btodd[0].market[x].update;
                  btdata.away = btodd[0].market[x].moneyline.away != undefined ? btodd[0].market[x].moneyline.away: '-';
                  btdata.home = btodd[0].market[x].moneyline.home != undefined ? btodd[0].market[x].moneyline.home: '-';
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


}

module.exports.setBetState = setBetState;
