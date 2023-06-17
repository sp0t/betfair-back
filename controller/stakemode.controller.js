const { stakemode } = require('../models/stakemode');

exports.addStakeMode = async(req, res) => {
  const edge = req.body.edge;
  const max = req.body.max;
  const kellybalance = req.body.kellybalance;

  try{
    const result = await stakemode.insert({edge: edge, max: max, kellybalance: kellybalance});
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.removeStakeMode = async(req, res) => {
  try{
    const result = await stakemode.deleteMany({})
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


exports.modifyStakeMode = async(req, res) => {
  const edge = req.body.edge;
  const max = req.body.max;
  const kellybalance = req.body.kellybalance;

  try{
    await stakemode.deleteMany({});
    const result = await stakemode.insert({edge: edge, max: max, kellybalance: kellybalance});
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}