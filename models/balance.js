var mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema(
  {
    max: {type: Number, default: 0},
    available: {type: Number, default: 0},
  },
  { collection: 'balance' }
)
exports.balance = mongoose.model('balance', BalanceSchema)