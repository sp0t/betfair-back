var mongoose = require('mongoose');

const OddsSchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    monitId: {type: String, required: true},
    sportId: { type: String, required: true },
    sportName: { type: String, default: '' },
    competitionId: { type: String, required: true },
    competitionName: { type: String, default: '' },
    eventId: { type: String, required: true },
    away: { type: String, required: true },
    home: { type: String, required: true },
    gamedate: {type: String, default: ''},
    update: {type: String},
    betid: {type: String, default:'0'},
    market: [],
    state: { type: Number, default: 0 }
  },
  { collection: 'odds' }
)
exports.odds = mongoose.model('odds', OddsSchema)