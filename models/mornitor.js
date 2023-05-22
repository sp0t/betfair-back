var mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema(
  {
    sport: {type: String, required: true},
    state: {type: Boolean, default: false},
    sites: [],
  },
  { collection: 'mornitor' }
)
exports.mornitor = mongoose.model('mornitor', MonitorSchema)