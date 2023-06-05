const { monitor } = require('../models/monitor');
const {betSites, sportsId, competitionId } = require('../const/dic')
const { v4: uuidv4 } = require('uuid');

exports.addMonitor = async(req, res) => {
  const sport = req.body.sport;
  var sites = {};
  sites = req.body.sites;
  const id = uuidv4();

  console.log("===========================<", id);

  try{
    const result = await monitor.findOneAndUpdate({sport: sport},
      {
        sport:sport,
		monitId: id,
        sites:sites
      },
      {upsert: true, new: true, setDefaultsOnInsert: true}
    );
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.removeMonitor = async(req, res) => {
  const sport = req.body.sport;
  console.log('removeMornitor', req)
  try{
    const result = await monitor.findOneAndDelete({sport: sport})
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.getMonitor = async(req, res) => {
  const sport = req.query.sport;

  try{
    let result;
    if (sport == 'ALL')
      result = await monitor.find({}).sort({sport: 1})
    else
      result = await monitor.find({sport: sport})
    res.send(result)
  } catch(e) {
		res.status(500).send({message: "Something went wrong"});
  }
}

exports.setMonit = async(req, res) => {
	const state = req.body.state;
	const sport = req.body.sport;

	try {
		var resOne = await monitor.findOne({ sport: sport });
		resOne.monit = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setBetting = async(req, res) => {
	const state = req.body.state;
	const sport = req.body.sport;

	try {
		var resOne = await monitor.findOne({ sport: sport });
		resOne.betting = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setPlayMode = async(req, res) => {
	const state = req.body.state;
	const sport = req.body.sport;

	try {
		var resOne = await monitor.findOne({ sport: sport });
		resOne.playmode = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.updateMornitor = async(req, res) => {
	const sport = req.body.sport;
	const sites = req.body.sites;

  console.log('update mornitor====>', sport, sites);

	try {
		var resOne = await monitor.findOne({ sport: sport });
		resOne.sites = sites;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.getSport = (req, res) => {
  console.log('==========================sportsId')
  res.send(sportsId);
}

exports.getLeague = (req, res) => {
  console.log('==========================competitionId')
  res.send(competitionId);
}
