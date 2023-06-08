var mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema(
  {
    max: {type: Number, default: 10},
    available: {type: Number, default: 10},
  },
  { collection: 'balance' }
)
exports.balance = mongoose.model('balance', BalanceSchema)