const { match } = require('../models/match');

exports.getMatchs = async(req, res) => {
	const sportname = req.query.sportName;
	const competitionname = req.query.competitionName;
	const sport = sportname + '-' + competitionname;
  
	try{
	  var btret;
	  if (sportname == 'ALL')
		  btret = await match.find({state: 0, competitionName:{$ne:''}}).sort({sportName: 1, competitionName:1});
	  else if (competitionname == 'ALL')
		  btret = await match.find({sportName:  { $regex: sportname, $options: 'i' }, competitionName:{$ne:''}, state: 0}).sort({competitionName:1});
	  else
		  btret = await match.find({sportName: sport, competitionName:competitionname,  state: 0});
  

	  res.send(btret);
	} catch(e) {
	  res.status(500).send({message: e});
	}
  }
  

exports.setMatchStakeMode = async(req, res) => {
	const eventId = req.body.eventId;
	const stakemode = req.body.stakemode;
	const monitId = req.body.monitId;

	try {
		const result = await match.updateOne({ monitId: monitId, eventId:eventId }, { $set: { "stakemode": stakemode } });
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setMatchBetMode = async(req, res) => {
	const eventId = req.body.eventId;
	const state = req.body.state;

	try {
		var resOne = await match.findOne({ eventId:eventId });
		resOne.stakemode.betmode = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setMatchDiffMode = async(req, res) => {
	const eventId = req.body.eventId;
	const state = req.body.state;

	try {
		var resOne = await match.findOne({eventId:eventId});
		resOne.stakemode.diffmode = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setRun = async(req, res) => {
	const monitId = req.body.monitId;
	const eventId = req.body.eventId;
	const state = req.body.state;

	try {
    const result = await match.updateOne({ monitId: monitId, eventId:eventId }, { $set: { "stakemode.state": state } });
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}
