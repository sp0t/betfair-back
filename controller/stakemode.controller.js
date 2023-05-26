const { stakemode } = require('../models/stakemode');

exports.addStakeMode = async(req, res) => {
  const mode = req.body.mode;
  const from = req.body.from;
  const to = req.body.to;
  const fixed = req.body.fixed;
  const percent = req.body.percent;
  const max = req.body.max;

  console.log(req.body)

  try{
    const result = await stakemode.findOneAndUpdate({mode: mode, from: from, to: to, fixed: fixed, percent: percent, max: max},
      {
        mode: mode,
        from:from,
        to:to,
        fixed: fixed,
        percent: percent,
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
  const mode = req.body.mode;
  const from = req.body.from;
  const to = req.body.to;

  try{
    const result = await stakemode.findOneAndDelete({mode: mode, from: from, to: to})
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.getStakeMode = async(req, res) => {
  const mode = req.query.mode

  try{
    var ret;
    if (mode == 2)
      ret = await stakemode.find({})
    else
      ret = await stakemode.find({mode: mode})
    res.send(ret)
  } catch(e) {
    res.status(500).send({message: e});
  }
}
