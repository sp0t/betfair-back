const { mornitor } = require('./../models/mornitor');
const {betSites, sportsId, competitionId } = require('./../const/dic')

exports.addMornitor = async(req, res) => {
  const sport = req.body.sport;
  var sites = {};
  sites = req.body.sites;


  try{
    const result = await mornitor.findOneAndUpdate({sport: sport},
      {
        sport:sport,
        sites:sites
      },
      {upsert: true, new: true, setDefaultsOnInsert: true}
    );
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.removeMornitor = async(req, res) => {
  const sport = req.body.sport;
  console.log('removeMornitor', req)
  try{
    const result = await mornitor.findOneAndDelete({sport: sport})
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.getMornitor = async(req, res) => {
  try{
    const result = await mornitor.find({})
    res.send(result)
  } catch(e) {
		res.status(500).send({message: "Something went wrong"});
    // res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.setMornitor = async(req, res) => {
	const state = req.body.state;
	const sport = req.body.sport;

	try {
		var resOne = await mornitor.findOne({ sport: sport });
		resOne.state = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.setInPlay = async(req, res) => {
	const state = req.body.state;
	const sport = req.body.sport;

	try {
		var resOne = await mornitor.findOne({ sport: sport });
		resOne.play = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.getSport = (req, res) => {
  res.send(sportsId);
}

exports.getLeague = (req, res) => {
  res.send(competitionId);
}