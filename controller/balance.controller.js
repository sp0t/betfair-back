const { getAccountFund } = require('../lib/balance');
const { genBtToken } = require('../lib/token');
const { balance } = require('../models/balance');

exports.getBalance = async(req, res) => {
	var total = await getAccountFund();
	var data = {};

	try {
		var retval = await balance.find({});
		data.total = total;
		data.max = retval[0].max;
		data.available = retval[0].available;
		res.send(data);
	} catch (error) {
		await genBtToken();
		res.status(500).send({message: error});
	}
}

exports.setMaxBalance = async(req, res) => {
	var total = await getAccountFund();
	var max = req.body.max;

	if (max > total){
		res.send(0);
		return;
	}

	const instance = new balance({ max: max, available: max });

	try {
		await balance.deleteMany({});
		instance.save();
		res.send(1);
	} catch (error) {
		res.send(0);
	}
}

exports.resetAvailableBalance = async(req, res) => {

	try {
		var ret = await balance.find({});
		if (ret[0] == undefined){
			res.send(0);
			return;
		}
		ret[0].available = ret[0].max;
		ret.save();
		res.send(1);
	} catch (error) {
		res.send(0);
	}
}