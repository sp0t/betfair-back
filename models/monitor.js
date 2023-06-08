var mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema(
  {
    monitId: {type: String, required: true},
    sport: {type: String, required: true},
    monit: {type: Boolean, default: true},
    betting: {type: Boolean, default: false},
    playmode: {type: Boolean, default: false},
    kellymode: {type: Boolean, default: false},
    sites: [],
  },
  { collection: 'monitor' }
)
exports.monitor = mongoose.model('monitor', MonitorSchema)