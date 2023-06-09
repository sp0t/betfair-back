const { monitor } = require('../models/monitor');
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../models/auth');
const { genBtToken, genPsToken } = require('../lib/token')

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

exports.setKellyMode = async(req, res) => {
	const state = req.body.state;
	const sport = req.body.sport;

	try {
		var resOne = await monitor.findOne({ sport: sport });
		resOne.kellymode = state;
		const result = await resOne.save();
		res.send(result);
	} catch (error) {
		res.status(500).send({ message: error || 'Something went wrong' });
	}
}

exports.updateMonitor = async(req, res) => {
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

exports.getSport = async(req, res) => {
	await Promise.all([
		genBtToken(),
		genPsToken()
	])
  var session = await auth.find({});
  var sprots = {}

	console.log('session=========>', session)
  
  for (var x in session) {
	if (session[x].site == 'betfair') {
		var options = {
			headers: {
			  'X-Application': 'XCy3BR7EjehV32o3',
			  'Accept':'application/json',
			  'Content-type': "application/json",
			  'X-Authentication': session[x].token
			}
		  };

		var data = {
			"filter": {}
		}

		try {
			var btsport = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listEventTypes/', data, options);
			sprots.betfair = btsport.data;
		} catch (error) {
			console.log('===========================================>')	
		}
	}

	if (session[x].site == 'ps3838') {
		var options = {
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': session[x].token
			}
		  };

		var pssport = await axios.get("https://api.ps3838.com/v3/sports", options);
		sprots.ps3838 = pssport.data;
	}
  }
  res.send(sprots);
}

exports.getLeague = async(req, res) => {
  const site = req.query.site;
  const sportid = req.query.sportid;
  const session = await auth.findOne({site: site});
  var leagues = [];

  if (site == 'betfair') {
	var options = {
		headers: {
		  'X-Application': 'XCy3BR7EjehV32o3',
		  'Accept':'application/json',
		  'Content-type': "application/json",
		  'X-Authentication': session.token
		}
	  };

	var data = {
		"filter":{"eventTypeIds": [sportid]}
	}

	var btleague = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listCompetitions/', data, options);
	leagues = btleague.data;
  }

  if (site == 'ps3838') {
	var options = {
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': session.token
		},
		params: {
			sportId: sportid
		  }
	  };

	var psleague = await axios.get("https://api.ps3838.com/v3/leagues", options);
	leagues = psleague.data;
  }
  res.send(leagues);
}

exports.getMarket = async(req, res) => {
	const site = req.query.site;
	const sportid = req.query.sportid;
	const leagueid = req.query.leagueid;
	const session = await auth.findOne({site: site});
	console.log('sportid===>', sportid, 'leagueid===>', leagueid)
	var markets = [];
  
	if (site == 'betfair') {
	  var options = {
		  headers: {
			'X-Application': 'XCy3BR7EjehV32o3',
			'Accept':'application/json',
			'Content-type': "application/json",
			'X-Authentication': session.token
		  }
		};
  
	  var data = {
		  "filter":{"eventTypeIds": [sportid], "competitionIds": [leagueid]}
	  }
  
	  var btmarket = await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/listMarketTypes/', data, options);
		console.log(btmarket.data)
	  markets = btmarket.data;
	}
  
	if (site == 'ps3838') {
	  var options = {
		  headers: {
			'Content-Type': 'application/json',
			'Authorization': session.token
		  },
		  params: {
			  sportId: sportid
			}
		};
  
	  var psmarket = await axios.get("https://api.ps3838.com/v1/periods", options);
	  markets = psmarket.data;
	}
	res.send(markets);
  }


