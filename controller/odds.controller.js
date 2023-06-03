const { odds } = require('../models/odds');
const { bet } = require('../models/bet');


exports.getOddData = async(req, res) => {
	const monitId = req.query.monitId;
	const betId = req.query.betId;
    const away = req.query.away;
    const home = req.query.home;

	console.log(req.query)
  
	try{
		var [psodd, btodd] = await Promise.all([
			await odds.find({site:'ps3838', monitId:monitId, away:away, home:home, state: 0}),
			await odds.find({site:'betfair', monitId:monitId, away:away, home:home, state: 0})
			])
		var ret = {};
		ret.betfair = btodd[0];
		ret.ps3838 = psodd[0];

		if (betId != '0' ) {
			var betdata = await bet.find({betid: btodd[0].betid})
			ret.betdata = betdata[0];
		}
		else
			ret.betdata = [];

		res.send(ret);

	} catch(e) {
	  res.status(500).send({message: e});
	}
}

