var mongoose = require('mongoose');

const FormulaSchema = new mongoose.Schema(
  {
    id: {type: String, default: '0'},
    formula: {type: String, default: 'f = (p * (d - 1) -q) / (d - 1)'},
  },
  { collection: 'formula' }
)
exports.formula = mongoose.model('formula', FormulaSchema)