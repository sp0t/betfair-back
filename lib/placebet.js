const axios = require("axios");
const { odds } = require('./../models/odds');

const placebet = async(site1, competition1, site2, competition2, betrate, seesion) => {
    var current = new Date().getTime();

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

    for (var x in odd1) {
        if ((current - odd1[x].update) < 3000) {
            for (var y in odd2) {
                if ((odd1[x].home == odd2[y].home) && (odd1[x].away == odd2[y].away)) {
                    
                    var odd1val = odd1[x].market[odd1[x].market.length - 1];
                    var odd2val = odd2[y].market[odd2[y].market.length - 1];
                    var btawayprice = odd1val.moneyline.away.availableToBack[odd1val.moneyline.away.availableToBack.length - 1].price;
                    if(odd2val.moneyline.away != undefined) var psawayprice = odd2val.moneyline.away > 0 ? odd2val.moneyline.away / 100 + 1 : 100 / Math.abs(odd2val.moneyline.away) + 1;
                    var bthomeprice = odd1val.moneyline.home.availableToBack[odd1val.moneyline.home.availableToBack.length - 1].price;
                    if(odd2val.moneyline.home != undefined) var pshomeprice = odd2val.moneyline.home > 0 ? odd2val.moneyline.home / 100 + 1 : 100 / Math.abs(odd2val.moneyline.home) + 1;

                    console.log(btawayprice, psawayprice, bthomeprice, pshomeprice);

                    for (var z in betrate) {
                        if (btawayprice < bthomeprice) {
                            if ((betrate[z].from <= (btawayprice - psawayprice)) && ((btawayprice - psawayprice) < betrate[z].to)) 
                                funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.awayid, btawayprice, betrate[z].price, token, odd1[x].eventId))
                        }
                        else {
                            if ((betrate[z].from <= (bthomeprice - pshomeprice)) &&  ((bthomeprice - pshomeprice)<= betrate[z].to))
                                funcs.push(betting(odd1val.moneyline.marketid, odd1val.moneyline.homeid, bthomeprice, betrate[z].price, token, odd1[x].eventId))
                        }
                    }
                }
            }
           
        }
    }

    var ret = await Promise.all([funcs]);
}

const betting = async(marketid, selectionId, price, size, token, eventid) => {
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

    console.log(eventid, data)
    try {
        await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/', data, options);
        var betdata = await odds.find({eventId: eventid, state: 0});
        betdata.state = 2;
        await betdata.save();
    } catch (error) {
       console.error(error);
    }
}

module.exports.placebet = placebet;