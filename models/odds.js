var mongoose = require('mongoose');

const OddsSchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    sportId: { type: String, required: true },
    sportName: { type: String },
    competitionId: { type: String, required: true },
    competitionName: { type: String, required: true },
    eventId: { type: String, required: true },
    home: { type: String, required: true },
    away: { type: String, required: true },
    state: { type: String, default: 0 },
    update: {type: Number},
    market: []
  },
  { collection: 'odds' }
)
exports.odds = mongoose.model('odds', OddsSchema)