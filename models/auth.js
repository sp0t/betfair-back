var mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema(
  {
    site: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    token: {type: String, default:''}
  },
  { collection: 'auth' }
)
exports.auth = mongoose.model('auth', AuthSchema)