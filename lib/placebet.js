require("dotenv").config();
const axios = require("axios");
const { match } = require('./../models/match');
const { bet } = require('./../models/bet');
const { balance } = require('../models/balance');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});

const placebet = async(monitId, sportname, competition, stakemode, token, totalfund) => {
	
	var matchs = await match.find({monitId: monitId, betid: '0', state: 0, competitionName: {$ne: ''}});
	var funcs = [];

	for (var x in matchs) {
		if (matchs[x].ps3838odd.away != undefined && matchs[x].ps3838odd.home != undefined && matchs[x].betfairodd.away != undefined && matchs[x].betfairodd.home != undefined) {
			var btaway = matchs[x].betfairodd.away;
			var bthome = matchs[x].betfairodd.home;
			var psaway = matchs[x].ps3838odd.away;
			var pshome = matchs[x].ps3838odd.home;

			if (matchs[x].stakemode.state) {
				if (matchs[x].stakemode.diffmode == 0) {
					if (matchs[x].stakemode.betmode == 0) {
						if (bthome > btaway) {
							if ((matchs[x].stakemode.from <= Math.abs(btaway - psaway)) && Math.abs((btaway - psaway) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname,  matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						} else {
							if ((matchs[x].stakemode.from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						}
					}	else {
						var fund = (matchs[x].stakemode.stake * totalfund / 100) >  matchs[x].stakemode.max ? matchs[x].stakemode.max : (matchs[x].stakemode.stake * totalfund / 100);

						if (bthome > btaway) {
							if ((matchs[x].stakemode.from <= Math.abs(btaway - psaway)) && (Math.abs(btaway - psaway) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						} else {
							if ((matchs[x].stakemode.from <= Math.abs(bthome - pshome)) && (Math.abs(bthome - pshome) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						}
					}
				} else {
					if (matchs[x].stakemode.betmode == 0) {
						if (bthome > btaway) {
							if ((matchs[x].stakemode.from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						} else {
							if ((matchs[x].stakemode.from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						}
					}	else {
						var fund = (matchs[x].stakemode.stake * totalfund / 100) >  matchs[x].stakemode.max ? matchs[x].stakemode.max : (matchs[x].stakemode.stake * totalfund / 100);

						if (bthome > btaway) {
							if ((matchs[x].stakemode.from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						} else {
							if ((matchs[x].stakemode.from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < matchs[x].stakemode.to))
								funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
						}
					}
				}
			} else {
				for (var y in stakemode) {
					if (stakemode[y].diffmode == 0) {
						if (stakemode[y].betmode == 0) {
							if (bthome > btaway) {
								if ((stakemode[y].from <= Math.abs(btaway - psaway)) && Math.abs((btaway - psaway) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate));
									break;
								}
							} else {
								if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate));
									break;
								}
							}
						}	else {
							var fund = (stakemode[y].stake * totalfund / 100) >  stakemode[y].max ? stakemode[y].max : (stakemode[y].stake * totalfund / 100);

							if (bthome > btaway) {
								if ((stakemode[y].from <= Math.abs(btaway - psaway)) && Math.abs((btaway - psaway) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate));
									break;
								}
							} else {
								if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate));
									break;
								}
							}
						}
					} else {
						if (stakemode[y].betmode == 0) {
							if (bthome > btaway) {
								if ((stakemode[y].from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
									break;
								}
							} else {
								if ((stakemode[y].from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
									break;
								}
							}
						}	else {
							var fund = (stakemode[y].stake * totalfund / 100) >  stakemode[y].max ? stakemode[y].max : (stakemode[y].stake * totalfund / 100);

							if (bthome > btaway) {
								if ((stakemode[y].from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
									break;
								}
							} else {
								if ((stakemode[y].from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < stakemode[y].to)) {
									funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
									break;
								}
							}
						}
					}
				}
			} 
		}
	}

	var ret = await Promise.all([funcs]);
}

const betting = async(marketid, sportname, selectionId, price, size, token, eventid, away, home, leagueid, betplace, btaway, bthome, psaway, pshome, gamedate) => {

    console.log('betting notice.....');
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
				if (ret.data.status == 'SUCCESS')
				{
					await bet.insertMany ([
						{
							betid: ret.data.instructionReports[0].betId,
							betdate: ret.data.instructionReports[0].placedDate,
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
					])
					var betdata = await match.find({eventId: eventid, state: 0}); 
					betdata[0].betid = ret.data.instructionReports[0].betId;

					await betdata[0].save();

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

					var ret = await balance.find({});
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