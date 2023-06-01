const axios = require("axios");
const { odds } = require('./../models/odds');
const { bet } = require('./../models/bet');
const { v4: uuidv4 } = require('uuid');

const placebet = async(site1, competition1, site2, competition2, diffmode, betmode, stakemode, seesion) => {
    var current = new Date().toJSON();

    console.log('checking time.......', current);

    var options = {
        headers: {
          'X-Application': 'XCy3BR7EjehV32o3',
          'Accept':'application/json'
        }
      };

    var params = {
        'username':seesion.username,
        'password':seesion.password,
    }

    options.headers['Content-type'] = "application/x-www-form-urlencoded";

    var token = await axios.post("https://identitysso.betfair.com/api/login", params, options);
    token = token.data.token;
    
    var [odd1, odd2] = await Promise.all([
        odds.find({site: site1, competitionId: competition1.toString(), state: '0'}),
        odds.find({site: site2, competitionId: competition2.toString(), state: '0'})
    ]);

    var funcs = [];

    console.log(odd1, odd2)

    for (var x in odd1) {
        if (1) {
            for (var y in odd2) {
                if ((odd1[x].home == odd2[y].home) && (odd1[x].away == odd2[y].away) && (odd1[x].mornitId == odd2[y].mornitId)) {
                    
                    var odd1val = odd1[x].market[odd1[x].market.length - 1];
                    var odd2val = odd2[y].market[odd2[y].market.length - 1];
                    var btawayprice = odd1val.moneyline.away.availableToBack[odd1val.moneyline.away.availableToBack.length - 1].price;
                    if(odd2val.moneyline.away != undefined) var psawayprice = odd2val.moneyline.away > 0 ? odd2val.moneyline.away / 100 + 1 : 100 / Math.abs(odd2val.moneyline.away) + 1;
                    var bthomeprice = odd1val.moneyline.home.availableToBack[odd1val.moneyline.home.availableToBack.length - 1].price;
                    if(odd2val.moneyline.home != undefined) var pshomeprice = odd2val.moneyline.home > 0 ? odd2val.moneyline.home / 100 + 1 : 100 / Math.abs(odd2val.moneyline.home) + 1;

                    console.log('current time===>', new Date().toJSON(), btawayprice, psawayprice, bthomeprice, pshomeprice);

                    if (odd1[x].stakemode.state) {
                        if (odd1[x].stakemode.diffmode == 0) {
                            if (odd1[x].stakemode.betmode == 0) {
                                if (btawayprice < bthomeprice) {
                                    if ((odd1[x].stakemode.fixfrom <= Math.abs(btawayprice - psawayprice)) && Math.abs((btawayprice - psawayprice) < odd1[x].stakemode.fixto)) 
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, odd1[x].stakemode.fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                } else {
                                    if ((odd1[x].stakemode.fixfrom <= Math.abs(bthomeprice - pshomeprice)) && Math.abs((bthomeprice - pshomeprice) < odd1[x].stakemode.fixto))
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, odd1[x].stakemode.fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].home,  btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                }
                            } else {
                                var fund = odd1[x].stakemode.percent * totalfund / 100 >  odd1[x].stakemode.max ? odd1[x].stakemode.max : odd1[x].stakemode.percent * totalfund / 100;

                                if (btawayprice < bthomeprice) {
                                    if ((odd1[x].stakemode.fixfrom <= Math.abs(btawayprice - psawayprice)) && Math.abs((btawayprice - psawayprice) < odd1[x].stakemode.fixto)) {
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                } else {
                                    if ((odd1[x].stakemode.fixfrom <= Math.abs(bthomeprice - pshomeprice)) && Math.abs((bthomeprice - pshomeprice) < odd1[x].stakemode.fixto))
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].home, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                }
                            }
                        }
                        else {
                            if (odd1[x].stakemode.betmode == 0) {
                                if (btawayprice < bthomeprice) {
                                    if ((odd1[x].stakemode.percentfrom <= (Math.abs(btawayprice - psawayprice) * 100 / btawayprice)) && Math.abs((Math.abs(btawayprice - psawayprice) * 100 / btawayprice) < odd1[x].stakemode.percentto))
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, odd1[x].stakemode.fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                } else {
                                    if ((odd1[x].stakemode.percentfrom <= (Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice)) && Math.abs((Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice) < odd1[x].stakemode.percentto))
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, odd1[x].stakemode.fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].home , btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                }
                            } else {
                                var fund = odd1[x].stakemode.percent * totalfund / 100 >  odd1[x].stakemode.max ? odd1[x].stakemode.max : odd1[x].stakemode.percent * totalfund / 100;

                                if (btawayprice < bthomeprice) {
                                    if ((odd1[x].stakemode.percentfrom <= (Math.abs(btawayprice - psawayprice) * 100 / btawayprice)) && Math.abs((Math.abs(btawayprice - psawayprice) * 100 / btawayprice) < odd1[x].stakemode.percentto)) {
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                } else {
                                    if ((odd1[x].stakemode.percentfrom <= (Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice)) && Math.abs((Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice) < odd1[x].stakemode.percentto))
                                        funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home , competition1, odd1[x].home, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                }
                            }
                        }

                        for (var z in stakemode) {
                            if (diffmode == 0 && stakemode[z].mode == 0) {
                                if (betmode == 0) {
                                    if (btawayprice < bthomeprice) {
                                        if ((stakemode[z].from <= Math.abs(btawayprice - psawayprice)) && Math.abs((btawayprice - psawayprice) < stakemode[z].to)) 
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, stakemode[z].fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                    else {
                                        if ((stakemode[z].from <= Math.abs(bthomeprice - pshomeprice)) && Math.abs((bthomeprice - pshomeprice)<= stakemode[z].to))
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, stakemode[z].fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].home, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                } else {
                                    var fund = stakemode[z].percent * totalfund / 100 >  stakemode[z].max ? stakemode[z].max : stakemode[z].percent * totalfund / 100;

                                    if (btawayprice < bthomeprice) {
                                        if ((stakemode[z].from <= Math.abs(btawayprice - psawayprice)) && Math.abs((btawayprice - psawayprice) < stakemode[z].to)) 
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                    else {
                                        if ((stakemode[z].from <= Math.abs(bthomeprice - pshomeprice)) && Math.abs((bthomeprice - pshomeprice)<= stakemode[z].to))
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].home, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                }
                            } else if (diffmode == 1 && stakemode[z].mode == 1) {
                                if (betmode == 0) {
                                    if (btawayprice < bthomeprice) {
                                        if ((stakemode[z].from <= (Math.abs(btawayprice - psawayprice) * 100 / btawayprice)) && ((Math.abs(btawayprice - psawayprice) * 100 / btawayprice) < stakemode[z].to)) 
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, stakemode[z].fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                    else {
                                        if ((stakemode[z].from <= (Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice)) && ((Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice) < stakemode[z].to)) 
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, stakemode[z].fixed, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].home, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                } else {
                                    var fund = stakemode[z].percent * totalfund / 100 >  stakemode[z].max ? stakemode[z].max : stakemode[z].percent * totalfund / 100;

                                    if (btawayprice < bthomeprice) {
                                        if ((stakemode[z].from <= (Math.abs(btawayprice - psawayprice) * 100 / btawayprice)) && ((Math.abs(btawayprice - psawayprice) * 100 / btawayprice) < stakemode[z].to)) 
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].away, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
                                    else {
                                        if ((stakemode[z].from <= (Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice)) && ((Math.abs(bthomeprice - pshomeprice) * 100 / bthomeprice) < stakemode[z].to))
                                            funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, fund, token, odd1[x].eventId, odd1[x].away, odd1[x].home, competition1, odd1[x].home, btawayprice, bthomeprice, psawayprice.toFixed(2), pshomeprice.toFixed(2)))
                                    }
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


const betting = async(marketid, selectionId, price, size, token, eventid, away, home, leagueid, betplace, btaway, bthome, psaway, pshome) => {

    console.log('betting notice.....');
    var betfair = {away: btaway, home: bthome};
    var other = {away: psaway, home: pshome};
    const betid = uuidv4();

    // var options = {
    //     headers: {
    //       'X-Application': 'XCy3BR7EjehV32o3',
    //       'Accept':'application/json'
    //     }
    //   };
    // options.headers['Content-type'] = "application/json";
    // options.headers['X-Authentication'] = token;

    // data = {
    //     'marketId': marketid,
    //     'instructions': [
    //         {
    //             'selectionId': selectionId,
    //             'side': 'BACK', 
    //             'orderType': 'LIMIT',
    //             'limitOrder': {
    //                 'size': size,
    //                 'price': price
    //             }
    //         }
    //     ]
    //   }

    try {
        // await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/', data, options);
        var betdata = await odds.find({eventId: eventid, state: 0});
        await bet.insertMany ([
            {
                betid: betid,
                site: 'betfiar',
                betdate: new Date().toJSON(),
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
        betdata[0].state = 2;
        betdata[0].betid = betid;

        await betdata[0].save();
    } catch (error) {
       console.error(error);
    }
}
module.exports.placebet = placebet;