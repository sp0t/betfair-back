var mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema(
  {
    site: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
  },
  { collection: 'auth' }
)
exports.auth = mongoose.model('auth', AuthSchema)