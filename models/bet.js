var mongoose = require('mongoose');

const BetSchema = new mongoose.Schema(
  {
    site: {type:String, required:true},
    betdate: {type:String, required:true},
    away: {type:String, required:true},
    home: {type:String, required:true},
    odds: {type:Number, required:true},
    stake: {type:Number, required:true},
    place: {type:String, required:true},
    market:{type:String, required:true},
    league: {type:Number, required:true},
    state: {type:Number, default:0}
  },
  { collection: 'bet' }
)
exports.bet = mongoose.model('bet', BetSchema)