const mongoose = require('mongoose');

const UsuarioSchema = mongoose.Schema({
    usuario: String,            // Local
    senha: String,              // Local
    user_id: Number,            // Twitter
    oauth_token: String,        // Twitter
    oauth_token_secret: String, // Twitter
    screen_name: String         // Twitter
});

module.exports = mongoose.model("Usuario", UsuarioSchema);