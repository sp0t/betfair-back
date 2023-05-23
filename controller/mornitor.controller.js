const { mornitor } = require('./../models/mornitor');

exports.addMornitor = async(req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const price = req.body.price;

  try{
    const result = await mornitor.findOneAndUpdate({from: from, to: to, price: price},
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

exports.removeMornitor = async(req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const price = req.body.price;

  try{
    const result = await mornitor.findOneAndDelete({from: from, to: to, price: price})
    res.send(result);
  } catch(e) {
    res.status(500).send({message: e || "Something went wrong"});
  }
}

exports.getMornitor = async(req, res) => {
  try{
    const result = await mornitor.find({})
    console.log('getmornitor=======>', result);
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
