var mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema(
  {
    sport: {type: String, required: true},
    ps3838: {},
    betfair: {}
  },
  { collection: 'mornitor' }
)
exports.mornitor = mongoose.model('mornitor', MonitorSchema)