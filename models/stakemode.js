var mongoose = require('mongoose');

const StakeModeSchema = new mongoose.Schema(
  {
    edge: {type: Number, default: 0},
    max: {type: Number, default: 0},
    kellybalance: {type: Number, default: 0},
  },
  { collection: 'stakemode' }
)
exports.stakemode = mongoose.model('stakemode', StakeModeSchema)