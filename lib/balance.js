const { auth } = require('../models/auth');
const axios = require("axios");

const getAccountFund = async() => {
    var ret = await auth.find({site:'betfair'});
	var token = ret[0].token;
	var options = {
		headers: {
		  'X-Application': 'XCy3BR7EjehV32o3',
		  'Accept':'application/json',
		  'Content-type': "application/json",
		  'X-Authentication': token
		}
	};

    try {
        var retfund = await axios.post('https://api.betfair.com/exchange/account/rest/v1.0/getAccountFunds/', {}, options);
        var fund = retfund.data.availableToBetBalance;
        return fund;
    } catch (error) {
        return 0;
    }
}

module.exports.getAccountFund = getAccountFund;
