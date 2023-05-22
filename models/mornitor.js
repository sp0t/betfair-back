var mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema(
  {
    sport: {type: String, required: true},
    sites: [],
  },
  { collection: 'mornitor' }
)
exports.mornitor = mongoose.model('mornitor', MonitorSchema)