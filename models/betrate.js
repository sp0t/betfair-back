var mongoose = require('mongoose');

const BetRateSchema = new mongoose.Schema(
  {
    from: {type: Number, required: true},
    to: {type: Number, required: true},
    price: {type: Number, required: true},
    state: {type: Boolean, default: true}
  },
  { collection: 'betrate' }
)
exports.betrate = mongoose.model('betrate', BetRateSchema)