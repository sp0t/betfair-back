var mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    monitId: { type: String, required: true },
    sportName: { type: String, default: '' },
    competitionName: { type: String, default: '' },
    eventId: { type: String, required: true },
    away: { type: String, required: true },
    home: { type: String, required: true },
    gamedate: {type: String, default: ''},
    update: {type: Number},
    betid: {type: String, default:'0'},
    stakemode: {},
    betfairodd:{},
    ps3838odd:{},
    state: { type: Number, default: 0 },
  },
  { collection: 'match' }
)
exports.match = mongoose.model('match', MatchSchema)