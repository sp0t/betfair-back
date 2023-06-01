var mongoose = require('mongoose');

const OddsSchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    mornitId: {type: String, required: true},
    sportId: { type: String, required: true },
    sportName: { type: String, default: '' },
    competitionId: { type: String, required: true },
    competitionName: { type: String, default: '' },
    eventId: { type: String, required: true },
    eventName: { type: String, default: '' },
    home: { type: String, required: true },
    away: { type: String, required: true },
    state: { type: Number, default: 0 },
    matchday: {type: String, default: ''},
    update: {type: Number},
    betid: {type: String, default:'0'},
    stakemode: {},
    market: []
  },
  { collection: 'odds' }
)
exports.odds = mongoose.model('odds', OddsSchema)