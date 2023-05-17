var mongoose = require('mongoose');

const OddsSchema = new mongoose.Schema(
  {
    site: { type: String, required: true },
    sportId: { type: Number, required: true },
    sportName: { type: String },
    competitionId: { type: Number, required: true },
    competitionName: { type: String, required: true },
    eventId: { type: Number, required: true },
    home: { type: String, required: true },
    away: { type: String, required: true },
    market: []
  },
  { collection: 'odds' }
)
exports.odds = mongoose.model('odds', OddsSchema)