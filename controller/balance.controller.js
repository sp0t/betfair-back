const { getAccountFund } = require('../lib/balance');
const { genBtToken } = require('../lib/token');
const { balance } = require('../models/balance');

exports.getBalance = async(req, res) => {
	console.log('getbalance=====================3')
	var total = await getAccountFund();
	var data = {};

	console.log(total)

	try {
		var retval = await balance.find({});
		data.total = total;
		data.max = retval[0].max;
		data.available = retval[0].available;
		console.log(data)
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
		res.send({result: 0});
		return;
	}

	const instance = new balance({ max: max, available: max });

	try {
		await balance.deleteMany({});
		instance.save();
		res.send({result: 1});
	} catch (error) {
		res.send({result: 0});
	}
}

exports.resetAvailableBalance = async(req, res) => {
	try {
		console.log('=============================1')
		var ret = await balance.find({});
		if (ret[0] == undefined){
			res.send({result: 0});
			return;
		}

		console.log('=============================2', ret)
		ret[0].available = ret[0].max;
		console.log('=============================2', ret[0].max)
		ret[0].save();
		console.log('=============================3')
		res.send({result: 1});
	} catch (error) {
		res.send({result: 0});
	}
}