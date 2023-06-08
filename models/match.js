const { number } = require('mathjs');
var mongoose = require('mongoose');

const StakeModeSchema = new mongoose.Schema({
  diffmode: { type: Number, default: 0 },
  betmode: { type: Number, default: 0 },
  from: { type: Number, default: 0 },
  to: { type: Number, default: 0 },
  stake: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  probability: { type: Number, default: 0 },
  formula: { type: String, default: 'f = (p * (d - 1) - q) / (d - 1)' },
  kellybalance: { type: Number, default: 0 },
  state: { type: Boolean, default: false }
});

const MatchSchema = new mongoose.Schema(
  {
    monitId: { type: String, required: true },
    sportName: { type: String, default: '' },
    competitionName: { type: String, default: '' },
    eventId: { type: String, required: true },
    away: { type: String, required: true },
    home: { type: String, required: true },
    gamedate: {type: String, default: ''},
    update: {type: String},
    betid: {type: String, default:'0'},
    stakemode: StakeModeSchema,
    betfairodd:{},
    ps3838odd:{},
    state: { type: Number, default: 0 }
  },
  { collection: 'match' }
)
exports.match = mongoose.model('match', MatchSchema)