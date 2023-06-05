const { auth } = require('../models/auth')
const axios = require("axios");

const genBtToken = async() => {
	var session = await auth.find({site: 'betfair'});

	if (session != undefined) {
		var options = {
				headers: {
					'X-Application': 'XCy3BR7EjehV32o3',
					'Accept':'application/json'
				}
			};
		
		//getting token
		options.headers['Content-type'] = "application/x-www-form-urlencoded";
	
		var params = {
				'username':session[0].username,
				'password':session[0].password,
		}
	
		var token = await axios.post("https://identitysso.betfair.com/api/login", params, options);
		token = token.data.token;

		session[0].token = token;
		await session[0].save();
	}
}

module.exports.genBtToken = genBtToken;

const genPsToken = async() => {
	var session = await auth.find({site: 'ps3838'});

	if (session != undefined) {
		var str = session[0].username + ':' + session[0].password;
		token =  'Basic ' + Buffer.from(str, 'utf-8').toString('base64');
		session[0].token = token;
		await session[0].save();
	}
}

module.exports.genPsToken = genPsToken;