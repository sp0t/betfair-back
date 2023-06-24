require("dotenv").config();
const axios = require("axios");
const { match } = require('./../models/match');
const { odds } = require('./../models/odds');
const { bet } = require('./../models/bet');
const { balance } = require('../models/balance');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const { wss } = require('./socket');
const WebSocket = require('ws');
const webhookClient = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});

const convertDate = (dateString) => {
	const date = new Date(dateString);
  
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
  
	const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
	return formattedDate;
  }

const placebet = async(monitId, sportname, competition, token) => {
	
	var [matchs,  totalfund]= await Promise.all([
		match.find({monitId: monitId, betid: '0', state: 0, competitionName: {$ne: ''}}),
		balance.find({})
	]) 
	var funcs = [];

	for (var x in matchs) {
		if (matchs[x].ps3838odd.away != undefined && matchs[x].ps3838odd.home != undefined && matchs[x].betfairodd.away != undefined && matchs[x].betfairodd.home != undefined) {
			var btaway = matchs[x].betfairodd.away;
			var bthome = matchs[x].betfairodd.home;
			var psaway = matchs[x].ps3838odd.away;
			var pshome = matchs[x].ps3838odd.home;

			//console.log(btaway, ":", psaway, bthome, ":", pshome);

			if (btaway != '-' && psaway != '-') {
				//if (psaway * (1 + matchs[x].stakemode.edge / 100) > btaway) {
					var fund = matchs[x].stakemode.awayamount > matchs[x].stakemode.max ? matchs[x].stakemode.max : matchs[x].stakemode.awayamount;
					//console.log('away fund ---------------->', fund)
					if (fund > 0 && fund <= totalfund[0].available) {
						//console.log('can bet away')
						funcs.push(betting(matchs[x].betfairodd.marketid, sportname,  matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						totalfund[0].available = totalfund[0].available - fund;
					}
				//}
			}

			if (bthome != '-' && pshome != '-') {
				//if (pshome * (1 + matchs[x].stakemode.edge / 100) > bthome) {
					var fund = matchs[x].stakemode.homeamount > matchs[x].stakemode.max ? matchs[x].stakemode.max : matchs[x].stakemode.homeamount;
					//console.log('home fund ---------------->', fund)
					if (fund > 0 && fund <= totalfund[0].available) {
						//console.log('can bet home')
						funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						totalfund[0].available = totalfund[0].available - fund;
					}
				//}
			}
		}
	} 

	if (funcs.length > 0)
		var ret = await Promise.all([funcs]);
}

const betting = async(marketid, sportname, selectionId, price, size, token, eventid, away, home, leagueid, betplace, btaway, bthome, psaway, pshome, gamedate) => {

    console.log('betting notice.....', 'odd = ', price, 'stake = ', size);
    var betfair = {away: btaway, home: bthome};
    var other = {away: psaway, home: pshome};

    var options = {
        headers: {
          'X-Application': 'XCy3BR7EjehV32o3',
          'Accept':'application/json'
        }
      };
    options.headers['Content-type'] = "application/json";
    options.headers['X-Authentication'] = token;

	console.log('marketid', marketid, 'selectionId', selectionId)

    data = {
        'marketId': marketid,
        'instructions': [
            {
                'selectionId': selectionId,
                'side': 'BACK', 
                'orderType': 'LIMIT',
                'limitOrder': {
                    'size': size,
                    'price': price
                }
            }
        ]
      }

    try {
        var ret =  await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/', data, options);
		console.log(ret.data.status)
				if (ret.data.status == 'SUCCESS')
				{
					var [betresult, betdata, odddata] = await Promise.all([
						bet.insertMany ( [
							{
								betid: ret.data.instructionReports[0].betId,
								betdate: convertDate(ret.data.instructionReports[0].placedDate),
								gamedate: gamedate,
								away: away,
								home: home,
								odds: price,
								stake: size,
								place: betplace,
								market: 'moneyline',
								competition: leagueid,
								eventid: eventid,
								betfair: betfair,
								other: other,
								state: 0
							}
						]),						
						match.find({eventId: eventid, state: 0}),
						odds.find({site: 'betfair', competitionId: leagueid, eventId: eventid, state: 0})
					]) 

					if (betdata != undefined && odddata != undefined) {
						betdata[0].betid = ret.data.instructionReports[0].betId;
						odddata[0].betid = ret.data.instructionReports[0].betId;
	
						var [ret, ret1, ret2] = await Promise.all([
							balance.find({}),
							betdata[0].save(),
							odddata[0].save()
						])
					}

					var content = `Bet on ${away} vs ${home} in ${sportname}.\n(Place: ${betplace}, Stake: $${size}, Odd: ${price})`;

					const embed = new EmbedBuilder()
					.setTitle('Betfair')
					.setColor(0xff0000);

					await webhookClient.send({
						content: content,
						username: 'Betfair',
						avatarURL: 'https://i.imgur.com/oBPXx0D.png'
						// embeds: [embed],
					});

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

					if (ret[0] != undefined){
						ret[0].available = ret[0].available - size;
						ret[0].save();
					}

				}      
    } catch (error) {
       console.error(error);
    }
}
module.exports.placebet = placebet;