var mongoose = require('mongoose');

const StakeModeSchema = new mongoose.Schema(
  {
    diffmode: {type: Number, default:0},
    betmode: {type: Number, default:0},
    from: {type: Number, required: true},
    to: {type: Number, required: true},
    stake: {type: Number, required: true},
    max: {type: Number, default: 0},
    state: {type:Boolean, default: true}
  },
  { collection: 'stakemode' }
)
exports.stakemode = mongoose.model('stakemode', StakeModeSchema)