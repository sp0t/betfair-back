var mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema(
  {
    mornitId: {type: String, required: true},
    sport: {type: String, required: true},
    monit: {type: Boolean, default: true},
    betting: {type: Boolean, default: false},
    playmode: {type: Boolean, default: false},
    sites: [],
  },
  { collection: 'mornitor' }
)
exports.mornitor = mongoose.model('mornitor', MonitorSchema)