var mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema(
  {
    sport: {type: String, required: true},
    diffmode: {type:Number, default: 0},
    betmode: {type: Number, default: 0},
    monit: {type: Boolean, default: true},
    betting: {type: Boolean, default: false},
    playmode: {type: Boolean, default: false},
    market: {type: Number, default: 0},
    sites: [],
  },
  { collection: 'mornitor' }
)
exports.mornitor = mongoose.model('mornitor', MonitorSchema)