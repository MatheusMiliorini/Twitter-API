const mongoose = require("mongoose");
const senha = process.env.DB_PASSWORD;
const db = process.env.DB_NAME;
const user = process.env.DB_USERNAME;

mongoose.connect(`mongodb+srv://${user}:${senha}@cluster0-flhxl.gcp.mongodb.net/${db}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = mongoose;