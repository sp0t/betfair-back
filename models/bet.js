var mongoose = require('mongoose');

const BetSchema = new mongoose.Schema(
  {
    betid: {type:String, required:true},
    site: {type:String, required:true},
    betdate: {type:String, required:true},
    away: {type:String, required:true},
    home: {type:String, required:true},
    odds: {type:Number, required:true},
    stake: {type:Number, required:true},
    place: {type:String, required:true},
    market:{type:String, required:true},
    competition: {type:Number, required:true},
    eventid: {type: Number, required:true},
    betfair: {},
    other: {},
    state: {type:Number, default:0}
  },
  { collection: 'bet' }
)
exports.bet = mongoose.model('bet', BetSchema)