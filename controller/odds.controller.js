const { odds } = require('../models/odds');
const { bet } = require('../models/bet');

exports.getMatchs = async(req, res) => {
  const sportname = req.query.sportName;
  const competitionname = req.query.competitionName;
  const sport = sportname + '-' + competitionname;

  try{
    var btret, psret, ret={};
    if (sportname == 'ALL')
	    btret = await odds.find({site:'betfair',  state: { $ne: 1 }}).sort({sportName: 1, competitionName:1});
    else if (competitionname == 'ALL')
	    btret = await odds.find({site:'betfair', sportName:  { $regex: sportname, $options: 'i' },  state: { $ne: 1 }}).sort({competitionName:1});
    else
	    btret = await odds.find({site:'betfair', sportName: sport, competitionName:competitionname,  state: { $ne: 1 }});

    if (sportname == 'ALL')
      psret = await odds.find({site:'ps3838',  state: { $ne: 1 }}).sort({sportName: 1, competitionName:1});
    else if (competitionname == 'ALL')
      psret = await odds.find({site:'ps3838', sportName:  { $regex: sportname, $options: 'i' },  state: { $ne: 1 }}).sort({competitionName:1});
    else
      psret = await odds.find({site:'ps3838', sportName: sport,  state: { $ne: 1 }});

    ret['betfair'] = btret;
    ret['ps3838'] = psret;

    res.send(ret);
  } catch(e) {
    res.status(500).send({message: e});
  }
}

exports.getMatchData = async(req, res) => {
	const mornitId = req.query.mornitId;
    const away = req.query.away;
    const home = req.query.home;

	console.log(req.query)
  
	try{
		var [psodd, btodd] = await Promise.all([
			await odds.find({site:'ps3838', mornitId:mornitId, away:away, home:home}),
			await odds.find({site:'betfair', mornitId:mornitId, away:away, home:home})
			])
		var ret = {};
		ret.betfair = btodd[0];
		ret.ps3838 = psodd[0];

		console.log('btodd[0].betid', btodd[0].betid);

		if (btodd[0].betid != '0' ) {
			var betdata = await bet.find({betid: btodd[0]})
			ret.betdata = betdata[0];
		}
		else
			ret.betdata = [];

		console.log(ret)
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

	try {
    const result = await odds.updateOne({ sportId: sportId,  competitionId:competitionId, eventId:eventId }, { $set: { "stakemode.state": state } });
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

	try {
		const result = await odds.updateOne({ sportId: sportId,  competitionId:competitionId, eventId:eventId }, { $set: { "stakemode": stakemode } });
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}