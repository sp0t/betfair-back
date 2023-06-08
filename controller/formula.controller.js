const { v4: uuidv4 } = require('uuid');
const { formula } = require('../models/formula')

exports.getFormula = async(req, res) => {
	try {
		var ret = await formula.find({});
		res.send(ret);
	} catch (error) {
		res.status(500).send({message: error});
	}
}

exports.addFormula = async(req, res) => {
	const id = uuidv4();
	const equation = req.body.formula;

	console.log('equation=======================>', equation)

	try {
		var ret = await formula.find({formula: equation});
		if (ret[0] == undefined) {
			console.log('equation=======================>', equation)
			await formula.insertMany([
				{
					formula: equation,
					id: id
				}
			]);
		}
		res.send(ret);
	} catch (error) {
		res.status(500).send({message: error});
	}
}


exports.removeFormula = async(req, res) => {
	const equation = req.body.formula;
	try {
		var ret = await formula.deleteOne({formula: equation});
		res.send(ret);
	} catch (error) {
		res.status(500).send({message: error});
	}
}

exports.modifyFormula = async(req, res) => {
	const equation = req.body.formula;
	const id = req.body.id;
	console.log('=======================modofuFormula',  equation, id);
	try {
		var ret = await formula.findOneAndUpdate({id: id}, {formula: equation} , {upsert: true, new: true, setDefaultsOnInsert: true});
		res.send(ret);
	} catch (error) {
		res.status(500).send({message: error});
	}
}
