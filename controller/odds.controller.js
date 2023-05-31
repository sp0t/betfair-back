const { odds } = require('../models/odds');

exports.getMatchs = async(req, res) => {
  const sportname = req.query.sportName;
  const competitionname = req.query.competitionName;

  try{
    var ret;
    if (sportname == 'ALL')
      ret = await odds.find({site:'betfair',  state: { $ne: 1 }}).sort({sportName: 1, competitionName:1});
    else if (competitionname == 'ALL')
      ret = await odds.find({site:'betfair', sportName: sportname,  state: { $ne: 1 }}).sort({competitionName:1});
    else
      ret = await odds.find({site:'betfair', sportName: sportname, competitionName:competitionname,  state: { $ne: 1 }});

    res.send(ret);
  } catch(e) {
    res.status(500).send({message: e});
  }
}

exports.setMatchDiffMode = async(req, res) => {
	const sportId = req.body.sportId;
	const competitionId = req.body.competitionId;
	const eventId = req.body.eventId;
	const state = req.body.state;

	try {
		var resOne = await odds.findOne({ sportId: sportId,  competitionId:competitionId, eventId:eventId});
		resOne.stakemode.diffmode = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setMatchBetMode = async(req, res) => {
	const sportId = req.body.sportId;
	const competitionId = req.body.competitionId;
	const eventId = req.body.eventId;
	const state = req.body.state;

	try {
		var resOne = await odds.findOne({ sportId: sportId,  competitionId:competitionId, eventId:eventId });
		resOne.stakemode.betmode = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setRun = async(req, res) => {
	const sportId = req.body.sportId;
	const competitionId = req.body.competitionId;
	const eventId = req.body.eventId;
	const state = req.body.state;

  console.log(sportId, competitionId, eventId, state)

	try {
		var resOne = await odds.findOne({ sportId: sportId,  competitionId:competitionId, eventId:eventId });
		resOne.stakemode.state = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setMatchStakeMode = async(req, res) => {
	const sportId = req.body.sportId;
	const competitionId = req.body.competitionId;
	const eventId = req.body.eventId;
	const stakemode = req.body.stakemode;

  console.log(sportId, competitionId, eventId, stakemode)

	try {
		var resOne = await odds.findOne({ sportId: sportId,  competitionId:competitionId, eventId:eventId });
		resOne.stakemode.fixfrom = stakemode.fixfrom;
		resOne.stakemode.fixto = stakemode.fixto;
		resOne.stakemode.percentfrom = stakemode.percentfrom;
		resOne.stakemode.percentto = stakemode.percentto;
		resOne.stakemode.fixed = stakemode.fixed;
		resOne.stakemode.percent = stakemode.percent;
    	resOne.stakemode.max = stakemode.max;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}