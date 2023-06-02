const { stakemode } = require('../models/stakemode');

exports.addStakeMode = async(req, res) => {
  const diffmode = req.body.diffmode;
  const betmode = req.body.betmode;
  const from = req.body.from;
  const to = req.body.to;
  const stake = req.body.stake;
  const max = req.body.max;

  console.log(req.body)

  try{
    const result = await stakemode.findOneAndUpdate({diffmode: diffmode, betmode: betmode, from: from, to: to},
      {
        diffmode:diffmode,
        betmode: betmode,
        from:from,
        to:to,
        stake: stake,
        max: max,
        state: true
      },
      {upsert: true, new: true, setDefaultsOnInsert: true}
    );
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.removeStakeMode = async(req, res) => {
  const diffmode = req.body.diffmode;
  const betmode = req.body.betmode;
  const from = req.body.from;
  const to = req.body.to;
  const stake = req.body.stake;

  try{
    const result = await stakemode.findOneAndDelete({diffmode: diffmode, betmode: betmode, from: from, to: to, stake: stake})
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.getStakeMode = async(req, res) => {

  try{
    var ret;
    ret = await stakemode.find({})
    res.send(ret)
  } catch(e) {
    res.status(500).send({message: e});
  }
}
