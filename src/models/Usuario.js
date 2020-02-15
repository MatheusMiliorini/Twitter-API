const mongoose = require('mongoose');

const UsuarioSchema = mongoose.Schema({
    user_id: Number,
    oauth_token: String,
    oauth_token_secret: String,
    screen_name: String
});

module.exports = mongoose.model("Usuario", UsuarioSchema);