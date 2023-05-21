const { betrate } = require('./../models/betrate');

exports.addBetrate = async(req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const price = req.body.price;

  try{
    const result = await betrate.findOneAndUpdate({from: from, to: to, price: price},
      {
        from:from,
        to:to,
        price:price,
        state: true
      },
      {upsert: true, new: true, setDefaultsOnInsert: true}
    );
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.removeBetrate = async(req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const price = req.body.price;

  console.log(req.body)

  try{
    const result = await betrate.findOneAndDelete({from: from, to: to, price: price})
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.getBetrate = async(req, res) => {
  try{
    const result = await betrate.find({})
    res.send(result)
  } catch(e) {
    res.status(500).send({message: e});
  }
}
